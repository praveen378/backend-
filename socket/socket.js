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
  path: "/socket.io", // ✅ Prevents path conflict
});

const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (!userId) return;

  userSocketMap[userId] = socket.id;
  io.emit("onlineUsers", Object.keys(userSocketMap));
// for Message seen 
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

  // for calling
  socket.on("callUser", ({ toUserId, signalData, fromUserId, name }) => {
    const receiverSocketId = userSocketMap[toUserId];
    const callerSocketId = socket.id;

    console.log(`📞 ${name} (${fromUserId}) is calling ${toUserId}`);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incomingCall", {
        from: callerSocketId, // for WebRTC signaling
        signal: signalData,
        name,
      });
    } else {
      console.log(`❌ User ${toUserId} is not online`);
    }
  });

  // for calling
// Add this inside io.on("connection", ...) in socket.js
socket.on("acceptCall", ({ to, signal }) => {
  console.log(`✅ Call accepted. Sending signal back to: ${to}`);
  io.to(to).emit("callAccepted", signal);
});


  
  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("onlineUsers", Object.keys(userSocketMap));
  });
});

const getSocketId = (userId) => userSocketMap[userId];
export { io, app, server, getSocketId };
