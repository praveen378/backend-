 import { app, server } from "./socket/socket.js";
import "./socket/peer.js"; // 👈 Just import this to start PeerJS server
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connect } from "./db/connection.js";
import userRoutes from "./routes/user.routes.js";
import messageRoutes from "./routes/message.routes.js";
import errorMiddleware from "./middleware/error.middleware.js";

// Rest of your server.js code...

const PORT = process.env.PORT;

// Connect to Database
connect();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL, // Allow frontend
    credentials: true, // Allow cookies/auth headers
  })
);
app.use(express.json()); // Parse JSON requests
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/status", messageRoutes);

// Error Handling Middleware
app.use(errorMiddleware);

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
