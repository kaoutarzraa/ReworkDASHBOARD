import os
import json
import asyncio
import logging
import uuid
from typing import Dict, Any, List
from pathlib import Path
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from pydantic import BaseModel
import uvicorn

# Configuration
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
DATA_FILE = DATA_DIR / "data.json"
DATA_DIR.mkdir(exist_ok=True)

logging.basicConfig(level=logging.INFO)

# ------------------ JSON Data Manager ------------------
class JSONDataManager:
    def __init__(self, file_path: Path):
        self.file_path = file_path
        self._ensure_file_exists()

    def _ensure_file_exists(self):
        if not self.file_path.exists():
            with open(self.file_path, 'w', encoding='utf-8') as f:
                json.dump([], f)

    def read_data(self) -> Any:
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON data: {e}")

    def write_data(self, data: Any) -> None:
        with open(self.file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)

    def update_data(self, update_fn: callable) -> Any:
        current_data = self.read_data()
        updated_data = update_fn(current_data)
        self.write_data(updated_data)
        return updated_data

# ------------------ Connection Manager ------------------
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logging.info(f"Client connected: {client_id}")

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            logging.info(f"Client disconnected: {client_id}")

    async def send_json(self, message: Dict, client_id: str):
        try:
            if client_id in self.active_connections:
                await self.active_connections[client_id].send_json(message)
        except Exception as e:
            logging.warning(f"Error sending to {client_id}: {e}")

    async def broadcast(self, message: Dict):
        for client_id, connection in self.active_connections.items():
            await self.send_json(message, client_id)

# ------------------ File Watcher ------------------
class JSONFileWatcher(FileSystemEventHandler):
    def __init__(self, manager: ConnectionManager, data_manager: JSONDataManager):
        self.connection_manager = manager
        self.data_manager = data_manager

    def on_modified(self, event):
        if Path(event.src_path) == self.data_manager.file_path:
            logging.info("JSON file modified, notifying clients...")
            asyncio.create_task(self.notify_clients())

    async def notify_clients(self):
        try:
            data = self.data_manager.read_data()
            await self.connection_manager.broadcast({
                "type": "data_update",
                "data": data,
                "message": "Data has been updated"
            })
        except Exception as e:
            logging.error(f"Error notifying clients: {e}")

# ------------------ WebSocket Handler ------------------
class WebSocketHandler:
    def __init__(self, manager: ConnectionManager, data_manager: JSONDataManager):
        self.connection_manager = manager
        self.data_manager = data_manager

    async def handle_websocket(self, websocket: WebSocket, client_id: str):
        await self.connection_manager.connect(websocket, client_id)

        # Envoyer les données initiales
        initial_data = self.data_manager.read_data()
        await websocket.send_json({
            "type": "initial_data",
            "data": initial_data
        })

        try:
            while True:
                data = await websocket.receive_text()
                await self.handle_message(data, client_id)
        except WebSocketDisconnect:
            self.connection_manager.disconnect(client_id)

    async def handle_message(self, message: str, client_id: str):
        try:
            message_data = json.loads(message)
            message_type = message_data.get("type")

            if message_type == "update_request":
                updated_data = self.data_manager.update_data(
                    lambda current: message_data.get("data", current)
                )
                await self.connection_manager.broadcast({
                    "type": "data_update",
                    "data": updated_data,
                    "message": f"Data updated by client {client_id}"
                })

        except json.JSONDecodeError:
            await self.connection_manager.send_json({
                "type": "error",
                "message": "Invalid JSON message"
            }, client_id)

# ------------------ Pydantic Schema ------------------
class DataPayload(BaseModel):
    data: List[Dict[str, Any]]

# ------------------ FastAPI App Setup ------------------
app = FastAPI(title="Real-time Cable Tracker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialisation des services
data_manager = JSONDataManager(DATA_FILE)
connection_manager = ConnectionManager()
websocket_handler = WebSocketHandler(connection_manager, data_manager)

# Dossier data accessible
app.mount("/data", StaticFiles(directory=DATA_DIR), name="data")

# Routes API REST
@app.get("/api/data")
async def get_data():
    try:
        return data_manager.read_data()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/data")
async def update_data(payload: DataPayload):
    try:
        updated_data = data_manager.update_data(lambda _: payload.data)
        await connection_manager.broadcast({
            "type": "data_update",
            "data": updated_data,
            "message": "Data updated via REST API"
        })
        return updated_data
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# WebSocket avec UUID généré
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    client_id = str(uuid.uuid4())
    await websocket_handler.handle_websocket(websocket, client_id)

# Watchdog lancé au démarrage
@app.on_event("startup")
async def on_startup():
    observer = Observer()
    observer.schedule(JSONFileWatcher(connection_manager, data_manager), path=DATA_DIR, recursive=False)
    observer.start()
    app.state.observer = observer
    logging.info("File observer started.")

@app.on_event("shutdown")
async def on_shutdown():
    app.state.observer.stop()
    app.state.observer.join()
    logging.info("File observer stopped.")

# ------------------ Démarrage serveur ------------------
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)