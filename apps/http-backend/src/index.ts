import express from "express";
import cors from "cors";

import { errorHandler, notFound, protect } from "./middleware";
import { authRoutes } from "./routes/auth";
import { roomRoutes } from "./routes/room";
import { chatRoutes } from "./routes/chat";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Auth routes for NextAuth
app.use("/auth", authRoutes);
app.use("/chats", chatRoutes);
app.use("/room", roomRoutes);
app.use("/rooms", roomRoutes);


app.use(notFound);
app.use(errorHandler);


const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
