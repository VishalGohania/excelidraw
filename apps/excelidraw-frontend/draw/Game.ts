import { getExistingShapes, http } from "./http";
import { Shape, Tool } from "@/types/canvas";

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[];
  private roomId: string;
  private numericRoomId: number | null = null;
  private clicked: boolean;
  private startX = 0;
  private startY = 0;
  private selectedTool: Tool = "circle";
  private pencilPoints: {x: number; y: number}[] = [];
  private socket: WebSocket;
  private isDrawing = false;

  private currentUserId: string | null = null;
  private processedMessageHashes: Set<string> = new Set();

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.existingShapes = [];
    this.roomId = roomId;
    this.socket = socket;
    this.clicked = false;
    this.init();
    this.initHandlers();
    this.initMouseHandlers();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    console.log("Game instance destroyed");
  }

  setTool(tool: "circle" | "pencil" | "rect") {
    this.selectedTool = tool;
  }

  public getRoomId(): number | null {
    return this.numericRoomId;
  }

  handleResize() {
    this.clearCanvas();
  }

  async init() {
    try {
      this.numericRoomId = await this.getNumericRoomId(this.roomId);

      if(!this.numericRoomId) {
        console.error("Could not fetch a valid room ID for this slug.");
        return;
      }

      // Join both numeric and slug rooms after we know the numeric ID
      const doJoin = () => {
        this.socket.send(JSON.stringify({ type: "join_room", roomId: this.numericRoomId }));
        this.socket.send(JSON.stringify({ type: "join_room", roomId: this.roomId }));
      };
      if (this.socket.readyState === WebSocket.OPEN) {
        doJoin();
      } else {
        this.socket.addEventListener('open', () => doJoin(), { once: true });
      }

      try {
        this.existingShapes = await getExistingShapes(String(this.numericRoomId));
        this.clearCanvas();
      } catch (error) {
        console.error("Failed to load existing shapes:", error);
        this.existingShapes = [];
      }

      console.log("Game initialized with roomId:", this.numericRoomId);
    } catch (error) {
      console.error("Failed to initialize the game:", error);
    }
  }

  private async getNumericRoomId(slug: string): Promise<number | null> {
    try {
      const res = await http.get(`/room/${slug}`);
      return res.data?.data?.room?.id || null;
    } catch (error) {
      console.error(`Failed to fetch room details for slug: ${slug}`, error);
      return null;
    }
  }

  initHandlers() {
    this.socket.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "chat") {
          try {
            // Try to parse the message as a shape
            const raw = String(message.message);
            if (this.processedMessageHashes.has(raw)) {
              return;
            }
            const parsedShape = JSON.parse(raw);
            if (parsedShape.shape) {
              this.processedMessageHashes.add(raw);
              this.existingShapes.push(parsedShape.shape);
              this.clearCanvas();
            }
          } catch {
            // Regular chat message, not a shape
            console.log("Regular text chat:", message.message);
          }
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    });

    this.socket.addEventListener('error', (event) => {
      console.warn("WebSocket error in Game", { readyState: this.socket.readyState, type: event.type });
    });

    this.socket.addEventListener('close', (event) => {
      console.log("WebSocket connection closed in Game:", event.code, event.reason);
    });
  }

  // Helper method to get current user ID
  private getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  private sendDrawingData(shape: Shape) {
    if (this.socket.readyState === WebSocket.OPEN) {
      // Send as "chat" message to match your existing server
      const payload = JSON.stringify({ shape });
      const targets: (number | string)[] = [];
      if (this.numericRoomId !== null) targets.push(this.numericRoomId);
      targets.push(this.roomId);

      targets.forEach((rid) => {
        const drawData = { type: "chat", message: payload, roomId: rid };
        console.log("Sending draw data with roomId:", rid);
        this.socket.send(JSON.stringify(drawData));
      });
    } else {
      console.error("WebSocket is not open, cannot send drawing data. State:", this.socket.readyState);
    }
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "#111827"; 
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Redraw all existing shapes
    this.existingShapes.forEach((shape) => {
      this.drawShape(shape);
    });
  }

  private drawShape(shape: Shape) {
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    if (shape.type === "rect") {
      this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);

    } else if (shape.type === "circle") {
      this.ctx.beginPath();
      this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.closePath();

    } else if (shape.type === "pencil") {
      if (shape.points && shape.points.length > 0) {
        this.ctx.beginPath();
        this.ctx.moveTo(shape.points[0].x, shape.points[0].y);
        for (let i = 1; i < shape.points.length; i++) {
          this.ctx.lineTo(shape.points[i].x, shape.points[i].y);
        }
        this.ctx.stroke();
        this.ctx.closePath();
      }
    }
  }

  mouseDownHandler = (e: MouseEvent) => {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    this.clicked = true;
    this.isDrawing = true;
    
    // Calculate coordinates accounting for potential scaling
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    this.startX = (e.clientX - rect.left) * scaleX;
    this.startY = (e.clientY - rect.top) * scaleY;

    if (this.selectedTool === "pencil") {
      this.pencilPoints = [{x: this.startX, y: this.startY}];
    }
  }

  mouseUpHandler = (e: MouseEvent) => {
    if(this.socket.readyState !== WebSocket.OPEN) {
      console.warn("Draw attempt on a non-open socket was prevented. State:", this.socket.readyState);
      this.isDrawing = false;
      return;
    }

    if (!this.clicked || !this.isDrawing) return;
    
    this.clicked = false;
    this.isDrawing = false;
    
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    const endX = (e.clientX - rect.left) * scaleX;
    const endY = (e.clientY - rect.top) * scaleY;
    const width = endX - this.startX;
    const height = endY - this.startY;

    let shape: Shape | null = null;

    if (this.selectedTool === "rect") {
      // Only create rect if it has some size
      if (Math.abs(width) > 5 && Math.abs(height) > 5) {
        shape = {
          type: "rect",
          x: this.startX,
          y: this.startY,
          width,
          height
        };
      }
    } else if (this.selectedTool === "circle") {
      const radius = Math.sqrt(width * width + height * height) / 2;
      // Only create circle if it has some size
      if (radius > 5) {
        shape = {
          type: "circle",
          radius: radius,
          centerX: this.startX + width / 2,
          centerY: this.startY + height / 2
        };
      }
    } else if (this.selectedTool === "pencil") {
      if (this.pencilPoints.length > 1) {
        shape = {
          type: "pencil",
          points: [...this.pencilPoints]
        };
      }
    }

    if (shape) {
      this.existingShapes.push(shape);
      this.clearCanvas();
      this.sendDrawingData(shape);
    } else {
      console.log("No shape created - too small or no movement");
    }

    // Clear pencil points for next drawing
    this.pencilPoints = [];
  }

  mouseMoveHandler = (e: MouseEvent) => {
    if (!this.clicked || !this.isDrawing) return;

    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    const currentX = (e.clientX - rect.left) * scaleX;
    const currentY = (e.clientY - rect.top) * scaleY;
    const width = currentX - this.startX;
    const height = currentY - this.startY;

    // Clear canvas and redraw existing shapes
    this.clearCanvas();

    // Set preview style
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    if (this.selectedTool === "rect") {
      this.ctx.strokeRect(this.startX, this.startY, width, height);
    } else if (this.selectedTool === "circle") {
      const radius = Math.sqrt(width * width + height * height) / 2;
      const centerX = this.startX + width / 2;
      const centerY = this.startY + height / 2;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.closePath();
    } else if (this.selectedTool === "pencil") {
      this.pencilPoints.push({x: currentX, y: currentY});
      if (this.pencilPoints.length > 1) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.pencilPoints[0].x, this.pencilPoints[0].y);
        for (let i = 1; i < this.pencilPoints.length; i++) {
          this.ctx.lineTo(this.pencilPoints[i].x, this.pencilPoints[i].y);
        }
        this.ctx.stroke();
        this.ctx.closePath();
      }
    }
  }

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    
    // Prevent context menu on right click
    this.canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    
    // Handle mouse leave to stop drawing
    this.canvas.addEventListener("mouseleave", (e) => {
      if (this.clicked) {
        this.mouseUpHandler(e as MouseEvent);
      }
    });
  }
}