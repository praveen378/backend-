 import { ExpressPeerServer } from "peer";
import http from "http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const peerApp = express();

const CLIENT_URL = process.env.CLIENT_URL || "https://baatekare.netlify.app";

// ✅ Enable CORS for Express routes
peerApp.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));

// ✅ Basic health route
peerApp.get("/", (req, res) => {
  res.send("🚀 PeerJS signaling server is live");
});

const peerServer = http.createServer(peerApp);

// ✅ Configure PeerJS server
const peer = ExpressPeerServer(peerServer, {
  debug: true,
  path: "/",
});

// ✅ Apply CORS headers manually for PeerJS
peer.on("connection", (client) => {
  console.log("🧩 Peer connected:", client.id);
});

peer.on("disconnect", (client) => {
  console.log("🔌 Peer disconnected:", client.id);
});

// ✅ Important: Add headers manually before /peerjs route
peerApp.use("/peerjs", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", CLIENT_URL);
  res.header("Access-Control-Allow-Credentials", "true");
  next();
}, peer);

const PORT = process.env.PORT || 3001;
peerServer.listen(PORT, () => {
  console.log(`📡 PeerJS Server running on port ${PORT}`);
});
