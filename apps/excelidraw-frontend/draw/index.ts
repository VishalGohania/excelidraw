import { getExistingShapes } from "./http";
import { http } from "./http"


type Shape = {
  type: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
} | {
  type: "circle";
  centerX: number;
  centerY: number;
  radius: number;
} | {
  type: "pencil";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export async function initDraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket): Promise<void> {
  const ctx = canvas.getContext("2d");

  if(!ctx) {
    console.error("Failed to get 2D context from canvas");
    return; 
  } 
  const existingShape: Shape[] =  await getExistingShapes(roomId);

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if(message.type == "chat"){
      try {
        const parsedMessage = JSON.parse(message.message);
        if(parsedMessage.shape) {
          existingShape.push(parsedMessage);
          clearCanvas(existingShape, canvas, ctx);
        }
      } catch (e) {
        console.error("Could not parse shape from websocket message", e);
      }
      
    }
  }

  clearCanvas(existingShape, canvas, ctx);
  let  clicked = false;
  let startX = 0;
  let startY = 0;

  canvas.addEventListener("mousedown", (e) => {
    clicked = true;
    startX = e.clientX;
    startY = e.clientY
  })

  canvas.addEventListener("mouseup", (e) => {
    clicked = false;
    const width = e.clientX - startX;
    const height = e.clientY - startY;

    //@ts-ignore
    const selectedTool = window.selectedTool;
    let shape: Shape | null = null;
    if(selectedTool === "rect") {
      const shape = {
        type: "rect",
        x: startX,
        y: startY,
        width,
        height
      }
    } else if(selectedTool === "circle") {
      const radius = Math.max(width, height)/2;
      shape = {
        type: "circle",
        radius: radius,
        centerX: startX + radius,
        centerY: startY + radius
      }
    }
    if(!shape) {
      return
    }

    existingShape.push(shape);
    
    socket.send(JSON.stringify({
      type: "chat",
      message: JSON.stringify({
        shape 
      }),
      roomId
    }))
  })

  canvas.addEventListener("mousemove", (e) => {
    if(clicked) {
      const width = e.clientX - startX;
      const height = e.clientY - startY;
      clearCanvas(existingShape, canvas, ctx);
      ctx.strokeStyle = "rgba(255, 255, 255)";
      //@ts-ignore
      const selectedTool = window.selectedTool;
      if(selectedTool === "rect") {
        ctx.strokeRect(startX, startY, width, height);
      } else if (selectedTool === "circle") {
        const radius = Math.max(width, height)/2;
        const centerX = startX + radius;
        const centerY = startY + radius;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
      }
    }
  })
}

function clearCanvas(existingShape: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0, 0, 0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  existingShape.map((shape) => {
    if(shape.type === "rect") {
      ctx.strokeStyle = "rgba(255, 255, 255)";
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    } else if (shape.type === "circle") {
      ctx.beginPath();
      ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();
    }
  })
}

