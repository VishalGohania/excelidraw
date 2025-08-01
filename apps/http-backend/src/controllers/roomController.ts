import { Request, RequestHandler, Response } from "express";
import { AuthRequest } from "../middleware";
import { json, serverError, unauthorized } from "../utils/response";
import slugify from "slugify";
import prisma from "@repo/db";

export const createRoom: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { roomName } = req.body;

    const user = req.user;

    if(!user || !user.id) {
      serverError(res, "Authentication error: User not found on request");
      return;
    }

    if(!roomName || typeof roomName !== 'string' || roomName.trim() === '') {
      serverError(res, "Room name is required and cannot be empty");
      return;
    }

    const uniqueSlug = slugify(`${roomName}-${Date.now()}`, {
      lower: true,
      strict: true
    });

    // create new room in database 
    const newRoom = await prisma.room.create({
      data: {
        slug: uniqueSlug,
        adminId: user.id,
      },
      select: {
        id: true,
        slug: true,
        createdAt: true,
        adminId: true
      }
    });

    json(res, { room: newRoom });

  } catch (error) {
    console.error("Failed to create a room: ", error);
    serverError(res, "An unecpected error occured while creating the room");
  }
}