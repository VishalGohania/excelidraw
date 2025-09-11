import { HTTP_BACKEND } from "@/config";
import axios from "axios";

export const http = axios.create({
  baseURL: HTTP_BACKEND,
  timeout: 15000,
});

export async function getExistingShapes(roomId: string) {
  try {
    const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);

    console.log("Chat response:", res.data);

    const messages = res.data?.data?.messages || [];

    if (!Array.isArray(messages)) {
      console.warn("Message is not an array", messages);
      return [];
    }

    const shapes = messages.map((x: { message: string }) => {
      try {
        const messageData = JSON.parse(x.message);
        return messageData.shape;
      } catch (error) {
        console.error("Failed to parse message:", x.message, error);
        return null;
      }
    }).filter(shape => shape !== null);

    return shapes;
  } catch (error) {
    console.error("Failed to fetch existing shapes:", error);
    return [];
  }

}