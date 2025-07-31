"use client"
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { http } from "@/draw"
export default function RoomPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false);

    const handleCreateRoom = async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            if (!session?.accessToken) {
                console.error("No access token found. Redirecting to auth page.");
                router.push("/auth");
                return;
            }

            // send a request to the backend to create a new Room
            const { data } = await http.post(
                "/room",
                {},
                {
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`;
                    }
                }
            );


            // Redirect to the canvas page using the unique room name from the response
            if (data?.room?.name) {
                router.push(`/canvas/${data.room.name}`);
            } else {
                console.error("Failed to get room name from server response.");
            }
        } catch (error) {
            toast.error("Failed to create room. Please try again.");
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

                        <Button
                            onClick={handleCreateRoom}
                            disabled={isLoading}
                            className="bg-[#0077FF] hover:bg-[#0066DD] text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors"
                        >
                            {isLoading ? 'Creating Room...' : 'Create a New Room'}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="ml-2 size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </Button>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}