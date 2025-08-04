import { Router } from "express";
import { createRoom, getUserRooms } from "../controllers/roomController";
import { getRoomBySlug } from "../controllers/dataController";
import { protect } from "../middleware";

const router: Router = Router();

router.post("/", protect, createRoom);

router.get("/", protect, getUserRooms);

router.get("/:slug", getRoomBySlug);

export  {router as roomRoutes };