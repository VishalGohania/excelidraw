import { Router } from "express";
import { createRoom } from "../controllers/roomController";

const router: Router = Router();

router.post("/", createRoom)

export default router;