import { RequestHandler, Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../../../../packages/db/src/clients";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../../../packages/backend-common/src/config";
import { json, serverError, unauthorized } from "../utils/response";
import { CreateUserSchema, SigninSchema } from "../../../../packages/common/src/types";

export const signupController: RequestHandler = async (req: Request, res: Response) => {
  const parsedData = CreateUserSchema.safeParse(req.body);
  if (!parsedData.success) {
    serverError(res, "Incorrect inputs provided for signup.");
    return; 
  }

  try {
    const { username: email, password, name } = parsedData.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      serverError(res, "User already exists with this email.");
      return; // Stop execution
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    json(res, { token, user: { id: user.id, name: user.name, email: user.email } });

  } catch (e) {
    console.error("Signup Error:", e);
    serverError(res, "An unexpected error occurred during signup.");
  }
};

export const signinController: RequestHandler = async (req: Request, res: Response) => {
  const parsedData = SigninSchema.safeParse(req.body);
  if (!parsedData.success) {
    serverError(res, "Incorrect inputs provided for signin.");
    return; 
  }

  try {
    const { username: email, password } = parsedData.data;
    const user = await prisma.user.findFirst({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      unauthorized(res, "Invalid email or password.");
      return;
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    json(res, { token, user: { id: user.id, name: user.name, email: user.email } });

  } catch (e) {
    console.error("Signin Error:", e);
    serverError(res, "An unexpected error occurred during signin.");
  }
};

export const googleUserController: RequestHandler = async (req: Request, res: Response) => {
    try {
        const { email, name, image } = req.body;
        if (!email) {
            serverError(res, "Email is required for Google sign-in.");
            return; 
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name: name || email.split('@')[0],
                    password: '', 
                    photo: image
                }
            });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET);
        json(res, { token, user: { id: user.id, name: user.name, email: user.email } });

    } catch (e) {
        console.error("Google User Error:", e);
        serverError(res, "An unexpected error occurred during Google sign-in.");
    }
};