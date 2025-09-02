// components/Canvas.tsx
import React, { useEffect, useRef } from 'react';
import { Game } from '@/draw/Game';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Circle, Square, Edit3 } from 'lucide-react';
import { Tool } from '@/types/canvas';

interface CanvasProps {
  roomId: string;
  socket: WebSocket;
}

export function Canvas({ roomId, socket }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [selectedTool, setSelectedTool] = React.useState<Tool>("circle");
  const [isConnected, setIsConnected] = React.useState(false);
  const router = useRouter();

  // Handle canvas resize
  // const handleResize = useCallback(() => {
  //   const canvas = canvasRef.current;
  //   if (canvas && gameRef.current) {
  //     const container = canvas.parentElement;
  //     if (container) {
  //       canvas.width = container.clientWidth;
  //       canvas.height = container.clientHeight;
  //       console.log("Canvas resized to:", canvas.width, "x", canvas.height);
  //       gameRef.current.handleResize();
  //     }
  //   }
  // }, []);

  // Initialize canvas and game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !socket) return;

    // Prevent multiple initializations
    if (gameRef.current) {
      console.log("Game already initialized, skipping");
      return;
    }

    console.log("Initializing new Game instance for room:", roomId);

    // Set initial canvas size
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      console.log("Canvas size set to:", canvas.width, "x", canvas.height);
    }

    // Initialize game
    const game = new Game(canvas, roomId, socket);
    gameRef.current = game;

    // Add resize listener
    const handleResize = () => game.handleResize();
    window.addEventListener('resize', handleResize);

    // Monitor WebSocket connection
    const connectionInterval = setInterval(() => {
      setIsConnected(socket.readyState === WebSocket.OPEN);
    }, 1000);

    return () => {
      console.log("Cleaning up Game instance");
      window.removeEventListener('resize', handleResize);
      clearInterval(connectionInterval);
      if (gameRef.current) {
        gameRef.current.destroy();
        gameRef.current = null;
      }
    };
  }, [roomId, socket]);

  // Update tool when selection changes
  useEffect(() => {
    if (gameRef.current) {
      gameRef.current.setTool(selectedTool);
    }
  }, [selectedTool]);

  const handleExitRoom = () => {
    // Send leave room message
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: "leave_room",
        roomId: gameRef.current?.getRoomId() ?? undefined
      }));
    }
    // Clean up game
    if (gameRef.current) {
      gameRef.current.destroy();
    }
    // Navigate back to rooms page
    router.push("/room");
  };

  const getRoomDisplayName = (slug: string) => {
    return slug.split('-').slice(0, -1).join('-') || slug;
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      {/* Header with Exit and Tools */}
      <div className="bg-gradient-to-r from-gray-800/20 to-black/20 backdrop-blur-sm border-b border-white/10 p-2 sm:p-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
          {/* Left side - Exit button and room name */}
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Button
              onClick={handleExitRoom}
              variant="outline"
              className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white border-0 flex items-center gap-2 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden xs:inline">Exit Room</span>
              <span className="xs:hidden">Exit</span>
            </Button>
            <div className="text-sm sm:text-lg font-medium text-gray-300 truncate">
              Room: {getRoomDisplayName(roomId)}
            </div>
          </div>

          {/* Right side - Drawing tools */}
          <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-center sm:justify-end">
            <span className="text-xs sm:text-sm text-gray-400 mr-1 sm:mr-3">Tools:</span>
            <Button
              onClick={() => setSelectedTool("circle")}
              variant={selectedTool === "circle" ? "default" : "outline"}
              className={`flex items-center gap-1 sm:gap-2 transition-all duration-300 text-xs sm:text-sm px-2 sm:px-4 hover:from-gray-700 hover:to-gray-900 transform hover:scale-105 ${selectedTool === "circle"
                ? "bg-gradient-to-r from-gray-600 to-gray-800 text-white transform scale-105"
                : "text-gray-900 border-gray-600 hover:bg-gray-700 hover:text-white"
                }`}
            >
              <Circle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Circle</span>
            </Button>
            <Button
              onClick={() => setSelectedTool("rect")}
              variant={selectedTool === "rect" ? "default" : "outline"}
              className={`flex items-center gap-1 sm:gap-2 transition-all duration-300 text-xs sm:text-sm px-2 sm:px-4 ${selectedTool === "rect"
                ? "bg-gradient-to-r from-gray-600 to-gray-800 text-white transform scale-105"
                : "text-gray-900 border-gray-600 hover:bg-gray-700 hover:text-white"
                }`}
            >
              <Square className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Rectangle</span>
            </Button>
            <Button
              onClick={() => setSelectedTool("pencil")}
              variant={selectedTool === "pencil" ? "default" : "outline"}
              className={`flex items-center gap-1 sm:gap-2 transition-all duration-300 text-xs sm:text-sm px-2 sm:px-4 ${selectedTool === "pencil"
                ? "bg-gradient-to-r from-gray-600 to-gray-800 text-white transform scale-105"
                : "text-gray-900 border-gray-600 hover:bg-gray-700 hover:text-white"
                }`}
            >
              <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Pencil</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-grow p-2 sm:p-4 flex items-center justify-center">
        <div className="w-full h-full bg-gradient-to-r from-gray-800/20 to-black/20 backdrop-blur-sm rounded-lg shadow-2xl border border-white/10 p-1 sm:p-2">
          <canvas
            ref={canvasRef}
            className="w-full h-full rounded-lg cursor-crosshair block"
            style={{
              backgroundColor: '#111827',
              imageRendering: 'pixelated' // Prevent canvas scaling blur
            }}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 bg-gray-800 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-lg shadow-lg mr-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs sm:text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
    </div>
  );
}