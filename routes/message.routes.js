import express from "express";
const router = express.Router();
 
import { isAuthenticated } from "../middleware/auth.middleware.js";
import {
  getUnreadSenders,
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

router.get("/get-notificationIds/:myId", isAuthenticated, getUnreadSenders);
 
export default router;

