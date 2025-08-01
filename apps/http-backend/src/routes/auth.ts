import { Router } from "express";
import { googleUserController, signinController, signupController } from "../controllers/authController";

const router: Router = Router();

// NextAuth endpoints
router.post("/login", signinController);
router.post("/signup", signupController);
router.post("/google-user", googleUserController);

export { router as authRoutes }; 