import { Router } from "express";
import { getChatByRoomId } from "../controllers/dataController";

const router: Router = Router();

router.get("/:roomId", getChatByRoomId);

export { router as chatRoutes }