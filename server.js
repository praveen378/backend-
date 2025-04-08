  import { ExpressPeerServer } from "peer";
import http from "http";
import express from "express";
import cors from "cors"; // ✅ You forgot to add this
import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT || 3001;
const peerApp = express();
peerApp.use(cors({
  origin: process.env.CLIENT_URL, // ✅ e.g. "https://baatekare.netlify.app"
  credentials: true,
}));

const peerServer = http.createServer(peerApp);

const peer = ExpressPeerServer(peerServer, {
  debug: true,
  path: "/",
});

peerApp.use("/peerjs", peer); // 👈 localhost:3001/peerjs/my-peer-id

peerServer.listen(PORT, () => {
  console.log("📡 PeerJS Server running on http://localhost:3001/peerjs");
});
