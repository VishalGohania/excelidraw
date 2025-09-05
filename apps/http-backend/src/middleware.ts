import { NextFunction, Request, RequestHandler, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import  prisma  from "@repo/db"

import { JWT_SECRET } from '@repo/backend-common';
import { unauthorized, forbidden } from "./utils/response";

export interface AuthRequest extends Request {
  user? : {
    id: string
  }
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};


export const protect: RequestHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token;
  if(
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1] ?? "";
      const decoded = jwt.verify(token, JWT_SECRET!) as JwtPayload;

      const user = await prisma.user.findUnique({
        where: {
          id: decoded.id
        },
        select: {
          id: true
        }
      })

      if(!user) {
        forbidden(res, "Invalid token: User not found");
        return;
      }

      req.user = {id: user.id};
      next();

    } catch (error) {
      console.error("Token verification failed", error);
      forbidden(res, "Not authorized, token failed.");
      return;
    }
  }

  if(!token) {
    unauthorized(res, "Not authorized, no token provided.");
    return;
  }
}






