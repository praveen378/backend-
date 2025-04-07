import { ExpressPeerServer } from "peer";
import http from "http";
import express from "express";
import dotenv from "dotenv";
dotenv.config();

const peerApp = express();
const peerServer = http.createServer(peerApp);

const peer = ExpressPeerServer(peerServer, {
  debug: true,
  path: "/",
});

peerApp.use("/peerjs", peer); // 👈 localhost:3001/peerjs/my-peer-id

peerServer.listen(3001, () => {
  console.log("📡 PeerJS Server running on http://localhost:3001/peerjs");
});
