import { Router } from "express";
import { authController } from "../controllers/authController";

const router: Router = Router();

// NextAuth endpoints
router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.post("/google-user", authController.googleUser);

export { router as authRoutes }; 