import { Router } from "express";
import { createRoom } from "../controllers/roomController";
import { getRoomBySlug } from "../controllers/dataController";

const router: Router = Router();

router.post("/", createRoom);
router.get("/:slug", getRoomBySlug);

export  {router as roomRoutes };