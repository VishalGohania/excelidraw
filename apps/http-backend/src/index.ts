import express from "express";
import { JWT_SECRET } from "@repo/backend-common/config";
import {CreateRoomSchema, CreateUserSchema, SigninSchema} from "@repo/common/types";
import { middleware } from "./middleware";
import jwt from "jsonwebtoken";
import { prismaClient } from "@repo/db/client"
import cors from "cors";
import bcrypt from 'bcrypt';
import { authRoutes } from "./routes/auth";

const app = express();
app.use(express.json());
app.use(cors());

// Auth routes for NextAuth
app.use("/auth", authRoutes);

// Legacy endpoints (keeping for backward compatibility)
app.post("/signup", async (req, res) => {
  const parsedData = CreateUserSchema.safeParse(req.body);
  if(!parsedData.success) {
    console.log(parsedData.error)
    res.json({
      message: "Incorrect Inputs"
    })
    return;
  }
  //db call
  try {
    const hashedPassword = await bcrypt.hash(parsedData.data.password, 10);
    const user = await prismaClient.user.create({
    data: {
      email: parsedData.data?.username,
      password: hashedPassword,
      name: parsedData.data.name
    }   
  })
  res.json({
    userId: user.id
  })
} catch(e) {
  res.status(411).json({
    message: "User already exists with this username"
  })
}
  
})

app.post("/signin", async (req, res) => {
  const parsedData = SigninSchema.safeParse(req.body);
  if(!parsedData.success) {
    res.json({
      message: "Incorrect Inputs"
    })
    return;
  }
  //db call
    const user = await prismaClient.user.findFirst({
      where: {
        email: parsedData.data?.username,
      }     
    })
   if(!user || !await bcrypt.compare(parsedData.data.password, user.password)) {
    res.status(403).json({
      message: "Invalid credentials"
    })
    return;
  }

  const token = jwt.sign({
    userId: user?.id
  }, JWT_SECRET)

  res.json({
    token
  })
})

app.post("/room", middleware, async (req, res) => {
  const parsedData = CreateRoomSchema.safeParse(req.body);
  if(!parsedData.success) {
    res.json({
      message: "Incorrect Inputs"
    })
    return;
  }
  const userId = req.userId;
  //db
  try {
    const room = await prismaClient.room.create({
      data: {
        slug: parsedData.data.name,
        adminId: userId!
      }
    })
    res.json({
      roomId: room.id
    })
  } catch(e) {
    res.status(411).json({
      message: "Room already exists with this name"
    })
  }
})

app.get("/chats/:roomId", async (req, res) => {
  const roomId = Number(req.params.roomId);
  const messages = await prismaClient.chat.findMany({
    where: {
      roomId: roomId
    },
    orderBy:{
      id: "desc"
    },
    take: 1000
  });

  res.json({
    messages
  })
})

app.get("/room/:slug", async (req, res) => {
  const slug = req.params.slug;
  const room = await prismaClient.room.findFirst({
    where: {
      slug
    }
  });

  res.json({
    room 
  })
})

// Function to try different ports
function startServer(ports: number[]) {
  let currentPortIndex = 0;

  function tryNextPort() {
    if(currentPortIndex >= ports.length) {
      console.error('all ports are in use');
      return;
    }

    const port = ports[currentPortIndex];
    const server = app.listen(port)
    .on('error', (err: any) => {
      if(err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is in use, trying next port...`);
        currentPortIndex++;
        tryNextPort();
      } else {
        console.error('Server error:', err);
      }
    })
    .on('listening', () => {
      console.log(`Server running on port ${port}`);
      // Export the current port for frontend use
      process.env.HTTP_PORT = port?.toString();
    })
  }
  tryNextPort();
}

startServer([3000, 3001, 3002]);