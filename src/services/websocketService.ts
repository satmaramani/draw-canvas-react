// WebSocket Service for connecting to Python WebSocket server
export interface UploadSession {
  id: string;
  roomId: string;
  qrCode: string;
  status: 'waiting' | 'connected' | 'uploading' | 'completed' | 'error';
  createdAt: Date;
}

export interface WebSocketMessage {
  type: 'draw' | 'chat' | 'image_processing' | 'ping' | 'pong' | 'connection' | 'user_joined' | 'user_left' | 'error';
  data?: any;
  room_id?: string;
  timestamp?: string;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private _isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private connectionHandlers: ((connected: boolean) => void)[] = [];
  private url: string;

  constructor() {
    // Use environment variable or default to local development
    const wsUrl = process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:8001';
    this.url = wsUrl;
  }

  // Public method to check connection status
  public isConnected(): boolean {
    return this._isConnected;
  }

  // Initialize WebSocket connection
  public initialize(onImageReceived?: (imageData: string) => void): UploadSession {
    const sessionId = this.generateSessionId();
    const roomId = `room_${sessionId}`;
    
    // Create WebSocket URL with room ID
    const wsUrl = `${this.url}/ws/${roomId}`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      this.setupEventHandlers();
      
      // Register image handler if provided
      if (onImageReceived) {
        this.messageHandlers.set('image_processing', (data) => {
          if (data.image) {
            onImageReceived(data.image);
          }
        });
      }
      
      // Create session object
      const session: UploadSession = {
        id: sessionId,
        roomId: roomId,
        qrCode: `${window.location.origin}/upload/${sessionId}`,
        status: 'waiting',
        createdAt: new Date()
      };
      
      return session;
      
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      throw new Error('Failed to initialize WebSocket connection');
    }
  }

  // Setup WebSocket event handlers
  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this._isConnected = true;
      this.reconnectAttempts = 0;
      this.notifyConnectionHandlers(true);
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this._isConnected = false;
      this.notifyConnectionHandlers(false);
      
      // Attempt to reconnect if not a normal closure
      if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.attemptReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this._isConnected = false;
      this.notifyConnectionHandlers(false);
    };
  }

  // Handle incoming messages
  private handleMessage(message: WebSocketMessage): void {
    console.log('Received WebSocket message:', message);
    
    // Handle ping/pong for connection health
    if (message.type === 'ping') {
      this.sendMessage({ type: 'pong' });
      return;
    }
    
    // Call registered handlers
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message.data);
    }
  }

  // Send message to WebSocket server
  public sendMessage(message: WebSocketMessage): void {
    if (this.ws && this._isConnected) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
      }
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  // Send drawing data
  public sendDrawingData(data: {
    x: number;
    y: number;
    color: string;
    brushSize: number;
    action: 'draw' | 'move' | 'end';
  }): void {
    this.sendMessage({
      type: 'draw',
      data: data
    });
  }

  // Send chat message
  public sendChatMessage(message: string, user: string = 'Anonymous'): void {
    this.sendMessage({
      type: 'chat',
      data: {
        message: message,
        user: user
      }
    });
  }

  // Send image processing request
  public sendImageProcessing(imageBase64: string, processingType: string = 'pencil_sketch'): void {
    this.sendMessage({
      type: 'image_processing',
      data: {
        image: imageBase64,
        type: processingType
      }
    });
  }

  // Register message handler
  public onMessage(type: string, handler: (data: any) => void): void {
    this.messageHandlers.set(type, handler);
  }

  // Register connection status handler
  public onConnectionChange(handler: (connected: boolean) => void): void {
    this.connectionHandlers.push(handler);
  }

  // Notify connection handlers
  private notifyConnectionHandlers(connected: boolean): void {
    this.connectionHandlers.forEach(handler => handler(connected));
  }

  // Attempt to reconnect
  private attemptReconnect(): void {
    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    setTimeout(() => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.initialize();
      }
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  // Generate unique session ID
  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Disconnect WebSocket
  public disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }
    this._isConnected = false;
    this.notifyConnectionHandlers(false);
  }

  // Get connection status
  public getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' | 'error' {
    if (this._isConnected) return 'connected';
    if (this.reconnectAttempts > 0) return 'connecting';
    if (this.ws && this.ws.readyState === WebSocket.CONNECTING) return 'connecting';
    return 'disconnected';
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService; 