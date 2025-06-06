import os
import json
import asyncio
from fastapi import FastAPI, WebSocket
from fastapi.staticfiles import StaticFiles
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

app = FastAPI()

# Configuration du chemin absolu
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "data", "data.json")

# Montage du dossier data pour servir le fichier JSON
app.mount("/backend/data", StaticFiles(directory=os.path.join(BASE_DIR, "data")), name="data")

class JsonFileHandler(FileSystemEventHandler):
    def __init__(self, websocket):
        self.websocket = websocket
    
    def on_modified(self, event):
        if event.src_path.endswith("data.json"):
            asyncio.run(self.send_update())
    
    async def send_update(self):
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                await self.websocket.send_json({
                    "type": "data_update",
                    "data": data
                })
        except Exception as e:
            print(f"Error handling file update: {e}")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    # Démarrer le watcher de fichier
    event_handler = JsonFileHandler(websocket)
    observer = Observer()
    observer.schedule(event_handler, path=os.path.dirname(DATA_FILE), recursive=False)
    observer.start()
    
    try:
        while True:
            # Garder la connexion ouverte
            await asyncio.sleep(1)
    finally:
        observer.stop()
        observer.join()

@app.get("/api/data")
async def get_data():
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"error": "data.json not found"}, 404
    except json.JSONDecodeError:
        return {"error": "Invalid JSON data"}, 400

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)