import { getExistingShapes, http } from "./http";
import { initDraw } from ".";
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
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler)
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler)
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler)

    console.log("Game instance destroyed");
  }

  setTool(tool: "circle" | "pencil" | "rect") {
    this.selectedTool = tool;
  }

  async init() {
    try {
      this.numericRoomId = await this.getNumericRoomId(this.roomId);

      if(!this.numericRoomId) {
        console.error("Could not fetch a valid room ID for this slug.");
        return;
      }

      try {
        this.existingShapes = await getExistingShapes(String(this.numericRoomId));
        this.clearCanvas();
      } catch (error) {
        console.error("Failed to load existing shapes:", error);
        this.existingShapes = [];
      }

      console.log("Game initialized with roomId:", this.numericRoomId)
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
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
  
      if(message.type === "chat"){
        try {
          const parsedShape = JSON.parse(message.message);
          if(parsedShape.shape) {
            this.existingShapes.push(parsedShape.shape);
            this.clearCanvas();
          }
        } catch (error) {
          console.error("Failed to parse shape from message:", error);
        }
        
      }
    }  
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(0, 0, 0)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
  this.existingShapes.map((shape) => {
    if(shape.type === "rect") {
      console.log(shape);
      this.ctx.strokeStyle = "rgba(255, 255, 255)";
      this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    } else if (shape.type === "circle") {
      this.ctx.beginPath();
      this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.closePath();
    } else if (shape.type === "pencil") {
      if(shape.points.length > 0) {
        this.ctx.strokeStyle = "rgba(255, 255, 255)";
        this.ctx.beginPath();
        this.ctx.moveTo(shape.points[0].x, shape.points[0].y);
        for(let i = 1; i < shape.points.length; i++) {
          this.ctx.lineTo(shape.points[i].x, shape.points[i].y);
        }
        this.ctx.stroke();
        this.ctx.closePath();
      }
    }
  })  
  }

  mouseDownHandler = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();    
    this.clicked = true;
    this.startX = e.clientX - rect.left;
    this.startY = e.clientY - rect.top;

    if(this.selectedTool === "pencil") {
      this.pencilPoints = [{x: this.startX, y: this.startY}];
    }
  }

  mouseUpHandler = (e: MouseEvent) => {
    if(!this.clicked) return;

    this.clicked = false;
    const rect = this.canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    const width = endX - this.startX;
    const height = endY - this.startY;
  
    const selectedTool = this.selectedTool;
      let shape: Shape | null = null;

      if(selectedTool === "rect") {
         shape = {
          type: "rect",
          x: this.startX,
          y: this.startY,   
          width,
          height
        }
      } else if(selectedTool === "circle") {
        const radius = Math.max(Math.abs(width), Math.abs(height))/2;
        shape = {
          type: "circle",
          radius: radius,
          centerX: this.startX + radius,
          centerY: this.startY + radius
        }
      } else if(selectedTool === "pencil") {
        shape = {
          type: "pencil",
          points: this.pencilPoints
        }
      }


      if(!shape) {
        return
      }

      this.existingShapes.push(shape);
      
      this.socket.send(JSON.stringify({
        type: "chat",
        message: JSON.stringify({
          shape 
        }),
        roomId: this.numericRoomId || this.roomId
      }))
  }

  mouseMoveHandler = (e: MouseEvent) => {
    if(!this.clicked) return;

    if(this.clicked) {
      const rect = this.canvas.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      const width = currentX - this.startX;
      const height = currentY - this.startY;

      this.clearCanvas();
      this.ctx.strokeStyle = "rgba(255, 255, 255)";

      const selectedTool = this.selectedTool;

      if(selectedTool === "rect") {
        this.ctx.strokeRect(this.startX, this.startY, width, height);

      } else if (selectedTool === "circle") {
        const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
        const centerX = this.startX + radius;
        const centerY = this.startY + radius; 
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.closePath();
        
      } else if (selectedTool === "pencil") {
        this.pencilPoints.push({x: currentX, y: currentY});
        this.ctx.beginPath();
        this.ctx.moveTo(this.pencilPoints[0].x, this.pencilPoints[0].y);
        for(let i = 1; i < this.pencilPoints.length; i++) {
          this.ctx.lineTo(this.pencilPoints[i].x, this.pencilPoints[i].y);
        }
        this.ctx.stroke();
        this.ctx.closePath();       
      }
    }
  }

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler)

    this.canvas.addEventListener("mouseup", this.mouseUpHandler)

    this.canvas.addEventListener("mousemove", this.mouseMoveHandler)
  }
}   