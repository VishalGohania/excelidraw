"use client";

import { WS_URL } from "@/config";
import { useEffect, useState } from "react";
import { Canvas } from "./Canvas";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

export function RoomCanvas({ roomId }: { roomId: string }) {
  console.log("RoomCanvas received roomId:", roomId, "Type:", typeof roomId);

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (status === "unauthenticated") {
      toast.error("Yout must be logged in to view this page");
      router.push("/auth");
      return;
    }

    if (status !== "authenticated" || !session?.user?.id) {
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
        router.push("/auth")
      }
    }

    // cleanup function 
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close(1000, "Component unmounting");
      }
    }
  }, [roomId, router, session, status])

  if (!socket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Connecting to server...</p>
        </div>
      </div>
    )
  }

  return <div>
    <Canvas roomId={roomId} socket={socket} />
  </div>
}