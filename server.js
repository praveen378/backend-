 import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { ExpressPeerServer } from "peer";

import { connect } from "./db/connection.js";
import userRoutes from "./routes/user.routes.js";
import messageRoutes from "./routes/message.routes.js";
import errorMiddleware from "./middleware/error.middleware.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ Place CORS and middlewares BEFORE routes and handlers
app.use(
  cors({
    origin: process.env.CLIENT_URL, // "https://baatekare.netlify.app"
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 🔌 Database connection
connect();

// 📦 Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/status", messageRoutes);

// 📡 PeerJS server
const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: "/",
});
app.use("/peerjs", peerServer);

// 🛡️ Global error middleware
app.use(errorMiddleware);

// 🚀 Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

