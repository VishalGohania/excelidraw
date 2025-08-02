"use client"
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { http } from "@/draw/http";


export default function RoomPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [roomName, setRoomName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roomName) {
            setError('Please enter a room name');
            toast.error('Please enter a room name');
            return
        }
        if (isLoading) return;

        try {
            if (!session?.accessToken) {
                toast.error("Authentication session not found. Please log in.");
                router.push("/auth");
                return;
            }

            setIsLoading(true);
            setError(null);

            // send a request to the backend to create a new Room
            const { data } = await http.post(
                "/room",
                { roomName: roomName },
                {
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`,
                    }
                }
            );


            // Redirect to the canvas page using the unique room name from the response
            if (data?.data?.room?.slug) {
                toast.success(`Room "${roomName}" created!`)
                router.push(`/canvas/${data.data.room.slug}`);
            } else {
                const errorMessage = data?.message || "Failed to get room details from server."
                setError(errorMessage);
                toast.error(errorMessage);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to create room details from server."
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen h-screen bg-[#111723] text-white p-8 flex justify-center items-center">
                <div className="max-w-4xl mx-auto mt-12">
                    <h1 className="text-3xl font-semibold mb-6 mt-4">Welcome to Your Workspace</h1>

                    <div className="bg-[#0E131E] rounded-lg p-6 m-6 mt-12 border border-gray-800">
                        <h2 className="text-2xl font-medium mb-4 m-4">Create a New Room</h2>
                        <p className="text-gray-400 mb-6">Start a new collaborative session by creating a room.</p>

                        <form onSubmit={handleCreateRoom} className="space-y-6">
                            <Input
                                type="text"
                                placeholder="Enter a name for your room"
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                className="bg-[#1C2433] border-gray-700 text-white placeholder-gray-500"
                                disabled={isLoading}
                            />

                            {error && <p className="text-sm text-red-500">{error}</p>}

                            <Button
                                type="submit"
                                disabled={isLoading || !roomName}
                                className="w-full bg-[#0077FF] hover:bg-[#0066DD] text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Creating Room...' : 'Create a New Room'}
                                {!isLoading && (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="ml-2 size-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}