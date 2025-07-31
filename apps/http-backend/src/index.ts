import express from "express";
import { JWT_SECRET } from "@repo/backend-common/config";
import {CreateRoomSchema, CreateUserSchema, SigninSchema} from "@repo/common/types";
import { errorHandler, notFound, protect } from "./middleware";
import jwt from "jsonwebtoken";
import prisma from "@repo/db";
import cors from "cors";
import bcrypt from 'bcrypt';
import { authRoutes } from "./routes/auth";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Auth routes for NextAuth
app.use("/auth", authRoutes);
app.use("/room", protect, roomRoutes);

app.use(notFound);
app.use(errorHandler);

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
    const user = await prisma.user.create({
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
    const user = await prisma.user.findFirst({
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

app.post("/room", protect, async (req, res) => {
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
    const room = await prisma.room.create({
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
  try {
    const roomIdParam = req.params.roomId;
    
    // Validate that roomId exists and is a valid number
    if (!roomIdParam || isNaN(Number(roomIdParam))) {
      res.status(400).json({
        message: "Invalid room ID. Room ID must be a valid number."
      });
      return;
    }
    
    const roomId = Number(roomIdParam);
    
    // Additional check to ensure it's a positive integer
    if (roomId <= 0 || !Number.isInteger(roomId)) {
      res.status(400).json({
        message: "Room ID must be a positive integer."
      });
      return;
    }
    
    const messages = await prisma.chat.findMany({
      where: {
        roomId: roomId
      },
      orderBy: {
        id: "desc"
      },
      take: 1000
    });

    res.json({
      messages
    });
    
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
});

app.get("/room/:slug", async (req, res) => {
  const slug = req.params.slug;
  const room = await prisma.room.findFirst({
    where: {
      slug
    }
  });

  res.json({
    room 
  })
})


const PORT = process.env.PORT |

| 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
