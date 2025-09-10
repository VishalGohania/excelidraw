import { WebSocketServer, WebSocket } from "ws";
import prisma from "@repo/db";

const port = Number(process.env.PORT) || 8080;
const wss = new WebSocketServer({
  port,
  host: "0.0.0.0"
});

interface User {
  ws: WebSocket,
  rooms: string[],
  userId: string,
  name: string
}

const users: User[] = [];

async function getUserFromSessionId(sessionId: string): Promise<{ userId: string, name: string } | null> {
  try {
    // Find user by ID directly since we're now passing the user ID from NextAuth session
    const user = await prisma.user.findUnique({
      where: { id: sessionId }
    });

    if (!user) {
      return null;
    }

    return {
      userId: user.id,
      name: user.name || 'Anonymous'
    };
  } catch (e) {
    console.error('Error getting user from session ID:', e);
    return null;
  }
}

wss.on('connection', async function connection(ws, request) {
  const url = request.url;
  if (!url) {
    ws.close(1008, 'URL required');
    return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const sessionId = queryParams.get('sessionId') || "";
  const userInfo = await getUserFromSessionId(sessionId);

  if (userInfo == null) {
    ws.close(1008, 'Invalid session');
    return null;
  }

  // Get user details from database
  const user = await prisma.user.findUnique({
    where: { id: userInfo.userId }
  })

  if (!user) {
    ws.close(1008, 'User not found');
    return;
  }

  const userConnection: User = {
    userId: userInfo.userId,
    name: user.name,
    rooms: [],
    ws
  }

  users.push(userConnection);

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'system',
    message: `Welcome ${user.name}`
  }))

  ws.on('message', async function message(data) {
    try {
      let parsedData;
      if (typeof data !== "string") {
        parsedData = JSON.parse(data.toString());
      } else {
        parsedData = JSON.parse(data);
      }

      if (!userConnection) {
        console.error("Received message from an unknown user connection.");
        return;
      }

      if (parsedData.type == "join_room") {
        const roomId = String(parsedData.roomId);
        const user = users.find(x => x.ws === ws);
        if (!userConnection.rooms.includes(roomId)) {
          userConnection.rooms.push(roomId);
        }

        const room = await prisma.room.findUnique({
          where: { id: Number(parsedData.roomId) }
        });

        if (!room) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Room not found'
          }))
          return;
        }

        ws.send(JSON.stringify({
          type: 'system',
          message: `Joined room: ${roomId}`
        }));
      }

      if (parsedData.type == "leave_room") {
        const roomId = String(parsedData.roomId);
        const user = users.find(x => x.ws === ws);
        if (!user) {
          return;
        }
        userConnection.rooms = userConnection.rooms.filter(x => x !== roomId)
        ws.send(JSON.stringify({
          type: 'system',
          message: 'LEFT room'
        }));
      }

      if (parsedData.type === "chat") {
        const roomId = String(parsedData.roomId);
        const message = parsedData.message;

        const room = await prisma.room.findUnique({
          where: { slug: roomId }
        })

        if (!room) {
          return;
        }
        // save message to database
        await prisma.chat.create({
          data: {
            roomId: room.id,
            message: message,
            userId: userConnection.userId
          }
        })

        // Broadcast to all users in the room
        users.forEach(user => {
          if (user.rooms.includes(roomId) && user.userId !== userConnection.userId && user.ws !== ws && user.ws.readyState === WebSocket.OPEN) {
            user.ws.send(JSON.stringify({
              type: "chat",
              message: message,
              roomId: roomId,
              userName: userConnection.name,
              timestamp: new Date().toISOString()
            }));
          }
        })
      }
    } catch (error) {
      console.error('Error handling message', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Error processing message'
      }));
    }
  });

  ws.on('close', () => {
    // Remove user from users array
    const index = users.findIndex(u => u.ws === ws);
    if (index !== -1) {
      users.splice(index, 1);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

console.log(`WebSocket server running on port ${port}`);