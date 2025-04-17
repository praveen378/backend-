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
    console.log(
      "receiverSocketId and callerSocketId",
      receiverSocketId,
      "amnd",
      callerSocketId
    );

    console.log(name, "is callingand id", name, fromUserId);
    io.to(receiverSocketId).emit("incomingCall", {
      from: socket.id,
      offer,
      name,
    });
  });

  // ✅ Handle call accepted

  socket.on("callAccepted", ({ to, ans }) => {
    console.log(`✅ Call accepted. Sending signal back to: ${to}`);
    io.to(to).emit("callAccepted", { from: socket.id, ans });
  });

// negotiate call
  socket.on("negotiate", ({ to, offer }) => {
    console.log(` ✅Negotiating call with: ${to}`);
    io.to(to).emit("callNegotiation", { from: socket.id, offer });
  });

  socket.on("peer:nego:done",({to,ans })=>{
    console.log(`Negotiation done with: ${to}`);
    io.to(to).emit("call:nego:final", { from: socket.id, ans });
  })
 // ✅ Handle ICE Candidate forwarding
socket.on("iceCandidate", ({ to, candidate }) => {
  console.log(`📡 Forwarding ICE candidate to: ${to}`);
  io.to(to).emit("iceCandidate", { candidate });
});
  // ✅ Handle call rejected
  socket.on("rejectCall", ({ to }) => {
    console.log(`❌ Call rejected. Notifying caller: ${to}`);

    // Notify caller for UI feedback
    io.to(to).emit("callRejectedStatus", { accepted: false });
  });
// ✅ Handle call ended
  socket.on("callCanceled",({to})=>{
    console.log("call cancelled from socket ", socket.id, "to ", to)
    io.to(to).emit("callEnded",{callStatus:false})
   })

  // ✅ Handle disconnect
  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("onlineUsers", Object.keys(userSocketMap));
  });
});

const getSocketId = (userId) => userSocketMap[userId];
export { io, app, server, getSocketId };
