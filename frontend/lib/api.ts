interface ReworkData {
  REWORK_DATE: string;
  ORDNR: string;
  SUBPROD: string;
  RWRK_CODE: string;
  DESCR: string;
  RWRK_DETAIL: string;
  Line: string;
  Area: string;
  Rework_time: number;
  Success: boolean;
  Priority: string;
  Defect_type: string;
  Defect_description: string;
  Status: string;
  knr?: string;
  shift?: string;
}

export async function fetchReworkData(): Promise<ReworkData[]> {
  const response = await fetch('http://localhost:8001/api/data');
  if (!response.ok) throw new Error("Failed to fetch data");
  return await response.json();
}

export function setupDataUpdates(callback: (data: ReworkData[]) => void): () => void {
  const ws = new WebSocket('ws://localhost:8001/ws');
  
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === "data_update") {
      callback(message.data);
    }
  };
  
  return () => ws.close();
}