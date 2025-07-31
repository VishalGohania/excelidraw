import { Request } from "express";
import { User } from "@repo/db"
import 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: User
}

declare module 'jsonwebtoken' {
  export interface JwtPayload {
    id: string; 
  }
}