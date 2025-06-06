// lib/websocket-service.ts
import { ReworkData } from './api';

type WebSocketCallback = (data: ReworkData[]) => void;

export class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private callbacks: WebSocketCallback[] = [];
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 secondes

  constructor(private url: string = 'ws://localhost:8000/ws') {}

  public connect(): void {
    if (this.socket) {
      return;
    }

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log('WebSocket connecté');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          if (response && response.data) {
            // Notifier tous les abonnés avec les nouvelles données
            this.callbacks.forEach(callback => callback(response.data));
          }
        } catch (error) {
          console.error('Erreur lors du traitement des données WebSocket:', error);
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket déconnecté');
        this.isConnected = false;
        this.socket = null;

        // Tenter de se reconnecter
        this.scheduleReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('Erreur WebSocket:', error);
        this.socket?.close();
      };
    } catch (error) {
      console.error('Erreur lors de la connexion WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts} dans ${this.reconnectDelay}ms`);
      
      this.reconnectTimer = setTimeout(() => {
        this.connect();
      }, this.reconnectDelay);
    } else {
      console.error('Nombre maximum de tentatives de reconnexion atteint');
    }
  }

  public subscribe(callback: WebSocketCallback): () => void {
    this.callbacks.push(callback);

    // Si pas encore connecté, se connecter
    if (!this.isConnected) {
      this.connect();
    }

    // Retourner une fonction pour se désabonner
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
      
      // Si plus d'abonnés, fermer la connexion
      if (this.callbacks.length === 0) {
        this.disconnect();
      }
    };
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.isConnected = false;
    this.callbacks = [];
  }
}

// Singleton pour partager la même instance dans toute l'application
export const websocketService = new WebSocketService();
