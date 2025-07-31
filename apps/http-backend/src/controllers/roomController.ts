import { Request, Response } from "express";
import { AuthRequest } from "../middleware";
import { json, serverError, unauthorized } from "../utils/response";
import slugify from "slugify";

export const createRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { roomName } = req.body;

    const user = req.user;

    if(!user || !user.id) {
      return serverError(res, "Authentication error: User not found on request");
    }

    if(!roomName || typeof roomName !== 'string') {
      return serverError(res, "Room name is required and must be a string");
    }

    const uniqueSlug = slugify(`${roomName}-${Date.now()}`, {
      lower: true,
      strict: true
    });

    // create new room in database 
    const newRoom = await prisma?.room.create({
      data: {
        slug: uniqueSlug,
        adminId: (user.id).toString(),
      },
      select: {
        id: true,
        slug: true,
        createdAt: true,
        adminId: true
      }
    });

    if(!newRoom) {
      return serverError(res, "Failed to create the room");
    }

    return json(res, { room: { newRoom }});
  } catch (error) {
    console.error("Failed to create a room: ", error);
    return serverError(res, "An unecpected error occured while creating the room");
  }
}