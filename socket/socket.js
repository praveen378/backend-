   import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import Message from "../models/message.model.js";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
  path: "/socket.io",
});

const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (!userId) return;

  userSocketMap[userId] = socket.id;
  io.emit("onlineUsers", Object.keys(userSocketMap));

  // ✅ Message Seen
  socket.on("messageSeen", async ({ senderId, receiverId }) => {
    try {
      const result = await Message.updateMany(
        {
          senderId,
          recieverId: receiverId,
          status: { $ne: "read" },
        },
        { $set: { status: "read" } }
      );

      const senderSocketId = userSocketMap[senderId];
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesReadByReceiver", {
          receiverId,
          count: result.modifiedCount,
        });
      }
    } catch (error) {
      console.error("❌ Error updating message status:", error);
    }
  });

  // ✅ Handle outgoing call
  socket.on("callUser", ({ toUserId, offer, fromUserId, name }) => {
    const receiverSocketId = userSocketMap[toUserId];
    const callerSocketId = socket.id;
  
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incomingCall", {
        from: socket.id,
        offer,
        name,
      });
    } else {
      console.log(`❌ User ${toUserId} is not online`);
    }
  });

  // ✅ Handle call accepted

  socket.on("acceptCall", ({ to, signal }) => {
    console.log(`✅ Call accepted. Sending signal back to: ${to}`);
  
    // Send signaling data to caller
    const callerSocketId = userSocketMap[to];
    if (callerSocketId) {
      io.to(callerSocketId).emit("callAccepted", signal);
    }
  });

  // ✅ Handle call rejected
  socket.on("rejectCall", ({ to }) => {
    console.log(`❌ Call rejected. Notifying caller: ${to}`);

    // Notify caller for UI feedback
    io.to(to).emit("callRejectedStatus", { accepted: false });
  });

  // ✅ Handle disconnect
  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("onlineUsers", Object.keys(userSocketMap));
  });
});

const getSocketId = (userId) => userSocketMap[userId];
export { io, app, server, getSocketId };
