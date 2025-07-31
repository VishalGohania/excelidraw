import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "@repo/db";

export const authController = {
  // NextAuth login endpoint
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }

      // Return user data in NextAuth format (just the user object)
      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
      };

      res.status(200).json(userData);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // NextAuth signup endpoint
  async signup(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        res.status(409).json({ message: "User already exists with this email" });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name
        }
      });

      // Return user data in NextAuth format (just the user object)
      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
      };

      res.status(201).json(userData);
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Google OAuth user endpoint
  async googleUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, name, image } = req.body;

      if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
      }

      // Check if user already exists
      let user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        // Create new user for Google OAuth
        user = await prisma.user.create({
          data: {
            email,
            name: name || email.split('@')[0], // Use email prefix if no name
            password: '', // Empty password for OAuth users
          }
        });
      }

      // Return user data in NextAuth format
      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
      };

      res.status(200).json(userData);
    } catch (error) {
      console.error("Google user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}; 