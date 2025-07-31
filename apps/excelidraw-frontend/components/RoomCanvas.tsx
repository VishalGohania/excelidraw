"use client";

import { WS_URL } from "@/config";
import { useEffect, useState } from "react";
import { Canvas } from "./Canvas";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function RoomCanvas({ roomId }: { roomId: string }) {
  console.log("RoomCanvas received roomId:", roomId, "Type:", typeof roomId);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
      return;
    }

    if (status !== "authenticated" || !session) {
      return;
    }

    const ws = new WebSocket(`${WS_URL}?sessionId=${session.user.id}`);

    ws.onopen = () => {
      setSocket(ws);
      ws.send(JSON.stringify({
        type: "join_room",
        roomId: roomId
      }))
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = (event) => {
      if (event.code === 1008) {
        // Authentication error
        router.push("/auth")
      }
    }
  }, [roomId, router, session, status])

  if (!socket) {
    return <div>
      Connecting to server....
    </div>
  }

  return <div>
    <Canvas roomId={roomId} socket={socket} />
  </div>
}