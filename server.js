 import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import { connect } from "./db/connection.js";
import { app as socketApp, server } from "./socket/socket.js"; // 🧠 Uses same Express app/socket
import userRoutes from "./routes/user.routes.js";
import messageRoutes from "./routes/message.routes.js";
import errorMiddleware from "./middleware/error.middleware.js";
 

dotenv.config();

const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL;

// 🔌 Connect to Database
connect();

// 🌐 Middlewares
socketApp.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
socketApp.use(express.json());
socketApp.use(express.urlencoded({ extended: true }));
socketApp.use(cookieParser());

// 🛣️ Routes
socketApp.use("/api/v1/users", userRoutes);
socketApp.use("/api/v1/messages", messageRoutes);
socketApp.use("/api/v1/status", messageRoutes);

// 🧯 Error handler
socketApp.use(errorMiddleware);

// 🚀 Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
