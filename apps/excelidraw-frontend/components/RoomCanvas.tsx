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
  const [isConnected, setIsConnected] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (status !== "authenticated" || !userId) {
      toast.error("Yout must be logged in to view this page");
      router.push("/auth");
      return;
    }

    const ws = new WebSocket(`${WS_URL}?sessionId=${userId}`);

    ws.onopen = () => {
      console.log('WebSocket connection established.');
      setSocket(ws);
      setIsConnected(true);
    };

    ws.onclose = (event) => {
      console.warn('WebSocket connection closed.', { code: event.code, reason: event.reason });
      setSocket(null);
      if (event.code === 1008) {
        router.push("/auth")
      }
      setIsConnected(false);
    }

    ws.onerror = (event) => {
      console.warn('WebSocket error event', {
        url: `${WS_URL}?sessionId=${userId}`,
        readyState: ws.readyState,
        type: event.type
      });
      setIsConnected(false);
    };
    // cleanup function 
    return () => {
      console.log("Cleaning up WebSocket connection.")
      ws.close(1000, "Component unmounting or dependencies changed");
    }
  }, [roomId, userId, status, router])



  if (!isConnected || !socket) {
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