"use client";

import { WS_URL } from "@/config";
import { use, useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";

export function RoomCanvas({roomId}: {roomId: string} ) {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0NzY2YmMwNy0yNjBjLTQ1ODgtOTQ4Yi1hZTU5OWU1ZjQwZGEiLCJpYXQiOjE3NDA1NjgxOTF9.nGku9dupsxgi82rvE4NAGySV3MB1K19ml5uy3JzOvzM`);

    ws.onopen = () => {
      setSocket(ws);
      ws.send(JSON.stringify({
        type: "join_room",
        roomId
      }))
    }
  },[])

  if(!socket) {
    return <div>
      Connecting to server....
    </div>
  }

  return <div>
    <Canvas roomId={roomId} socket={socket}/>
  </div>
}