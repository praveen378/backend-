import { ExpressPeerServer } from "peer";
import http from "http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const peerApp = express();

// ✅ Allow cross-origin requests from your frontend
peerApp.use(cors({
  origin: process.env.CLIENT_URL || "*", // fallback to * for dev
  credentials: true,
}));

// ✅ Optional: Health check
peerApp.get("/", (req, res) => {
  res.send("🚀 PeerJS signaling server is live");
});

const peerServer = http.createServer(peerApp);

// ✅ Configure PeerServer
const peer = ExpressPeerServer(peerServer, {
  debug: true,
  path: "/", // this makes route `/peerjs/id` valid
});

// ✅ Mount PeerJS server at /peerjs
peerApp.use("/peerjs", peer);

// ✅ Use dynamic port for Railway
const PORT = process.env.PORT || 3001;
peerServer.listen(PORT, () => {
  console.log(`📡 PeerJS Server running on port ${PORT}`);
});
