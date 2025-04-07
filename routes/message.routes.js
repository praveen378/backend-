import express from "express";
const router = express.Router();
import {
  getProfile,
  login,
  logout,
  register,
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import {
  recieveMessage,
  sendMessage,
} from "../controllers/message.controller.js";

import {
 
  updateMessagesStatusBySender,
} from "../controllers/update.controller.js";

router.post("/send/:recieverId", isAuthenticated, sendMessage);
router.get("/get-message/:otherParticipantId", isAuthenticated, recieveMessage);
 
router.put(
  "/sender/:senderId/:receiverId",
  isAuthenticated,
  updateMessagesStatusBySender
);
 
export default router;
