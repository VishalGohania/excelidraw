import { NextFunction, Request, Response } from "express";
import jwt, { decode, JwtPayload } from "jsonwebtoken";

import {JWT_SECRET} from '@repo/backend-common/config';

export function middleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["authorization"] ?? "";

  const decoded = jwt.verify(token , JWT_SECRET);

  if(decoded && typeof decoded !== "string") {
    req.userId = decoded.userId;
    next()
  } else {
    res.status(403).json({
      message: "Unauthorized"
    })
  }
}