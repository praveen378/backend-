import { ExpressPeerServer } from "peer";
import http from "http";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const CLIENT_URL = process.env.CLIENT_URL;
const peerApp = express();
const peerServer = http.createServer(peerApp);

peerApp.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));

const peer = ExpressPeerServer(peerServer, {
  debug: true,
  path: "/",
});

peerApp.use("/peerjs", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", CLIENT_URL);
  res.header("Access-Control-Allow-Credentials", "true");
  next();
}, peer);

peerServer.listen(3001, () => {
  console.log(`📡 PeerJS Server running at http://localhost:3001/peerjs`);
});
