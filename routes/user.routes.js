import express from "express";
const router = express.Router();
import {
  getOtherUsers,
  getProfile,
  login,
  logout,
  register,
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { sendMessage } from "../controllers/message.controller.js";
import { generateTwilioToken } from "../controllers/video.controller.js";
router.post("/register", register);
router.post("/login", login);
router.get("/get-profile", isAuthenticated, getProfile);
router.post("/logout", isAuthenticated, logout);
router.post("/messge", isAuthenticated, sendMessage);
router.get("/get-other-users", isAuthenticated, getOtherUsers);
 // ✅ New route for Twilio Video token
router.post("/video/token", isAuthenticated, generateTwilioToken);

export default router;
