"use client"
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { http } from "@/draw/http";

interface Room {
    id: number;
    slug: string;
    createdAt: string;
    adminId: string;
}


export default function RoomPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [roomName, setRoomName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingRooms, setIsLoadingRooms] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [existingRooms, setExistingRooms] = useState<Room[]>([])


    useEffect(() => {
        fetchExistingRooms();
    }, [session])

    const fetchExistingRooms = async () => {
        if (!session?.accessToken) {
            setIsLoadingRooms(false);
            return;
        }

        try {
            setIsLoadingRooms(true);
            const { data } = await http.get("/rooms", {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                }
            });

            if (data?.success && data?.data?.rooms) {
                setExistingRooms(data.data.rooms);
            }
        } catch (error) {
            console.error("Failed to fetch existing rooms:", error);
        } finally {
            setIsLoadingRooms(false);
        }
    }

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

    const handleJoinRoom = (roomSlug: string) => {
        router.push(`/canvas/${roomSlug}`);
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-8 flex justify-center items-start">
                <div className="max-w-6xl mx-auto mt-12 w-full">
                    <h1 className="text-3xl font-semibold mb-6 mt-4">Welcome to Your Workspace</h1>

                    {/* Create New Room Section */}
                    <div className="bg-gradient-to-r from-gray-800/20 to-black/20 backdrop-blur-sm rounded-lg p-6 mb-8 border border-white/10">
                        <h2 className="text-2xl font-medium mb-4">Create a New Room</h2>
                        <p className="text-gray-400 mb-6">Start a new collaborative session by creating a room.</p>

                        <form onSubmit={handleCreateRoom} className="space-y-6">
                            <Input
                                type="text"
                                placeholder="Enter a name for your room"
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-gray-500"
                                disabled={isLoading}
                            />

                            {error && <p className="text-sm text-red-500">{error}</p>}

                            <Button
                                type="submit"
                                disabled={isLoading || !roomName}
                                className="w-full bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center transition-all duration-300 transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:transform-none"
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

                    {/* Existing Rooms Section */}
                    <div className="bg-gradient-to-r from-gray-800/20 to-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-medium">Your Recent Rooms</h2>
                            <Button
                                onClick={fetchExistingRooms}
                                disabled={isLoadingRooms}
                                variant="outline"
                                className="text-white border-gray-600 hover:bg-gray-700"
                            >
                                {isLoadingRooms ? 'Loading...' : 'Refresh'}
                            </Button>
                        </div>

                        {isLoadingRooms ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                                <p className="text-gray-400">Loading your rooms...</p>
                            </div>
                        ) : existingRooms.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {existingRooms.map((room) => (
                                    <div
                                        key={room.id}
                                        className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-gray-500 transition-all duration-300 hover:shadow-lg"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-medium text-lg truncate">{room.slug.split('-').slice(0, -1).join('-')}</h3>
                                            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                                                {room.adminId === session?.user?.id ? 'Owner' : 'Member'}
                                            </span>
                                        </div>
                                        <Button
                                            onClick={() => handleJoinRoom(room.slug)}
                                            className="w-full bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white py-2 rounded transition-all duration-300 transform hover:scale-105"
                                        >
                                            Join Room
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="mx-auto h-12 w-12 text-gray-500 mb-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-300 mb-2">No rooms yet</h3>
                                <p className="text-gray-500">Create your first room to start collaborating!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}