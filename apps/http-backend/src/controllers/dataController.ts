import { RequestHandler } from "express";
import prisma from "@repo/db";
import { json, serverError } from "../utils/response";


export const getRoomBySlug: RequestHandler = async (req, res) => {
  try {
    const slug = req.params.slug;
    if (!slug) {
      serverError(res, "Room slug is required.")
      return;
    }
    const room = await prisma.room.findFirst({
      where: {
        slug
      }
    });
    if (!room) {
      res.status(404).json({ message: "Room not found" });
      return;
    }
    json(res, { room });
  } catch (e) {
    serverError(res, "Server error while fetching room.");
  }
}

export const getChatByRoomId: RequestHandler = async (req, res) => {
  try {
    const roomIdParam = req.params.roomId;
    if (!roomIdParam) {
      serverError(res, "RoomId is required");
      return;
    }
    const roomId = parseInt(roomIdParam, 10);
    if (isNaN(roomId)) {
      serverError(res, "Invalid Room Id. Must be a number")
      return;
    }

    const messages = await prisma.chat.findMany({
      where: {
        roomId: roomId
      },
      orderBy: {
        id: "desc"
      },
      take: 1000
    });

    json(res, { messages })

  } catch (error) {
    serverError(res, "Server error while fetching chats");
  }
}