import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import { asynchandler } from "../utility/asynHandler.utlity.js";
import { errorHandler } from "../utility/errorHandler.utility.js";
import { getSocketId, io } from "../socket/socket.js";
// import { Server, io } from "socket.io";

const generateToken = (userId) => {
  return jwt.sign({ _id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Send Messages
export const sendMessage = asynchandler(async (req, res, next) => {
  const senderId = req.user._id;
  const recieverId = req.params.recieverId;
  const message = req.body.message;

  if (!senderId || !recieverId || !message) {
    return next(new errorHandler("All fields are required", 400));
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, recieverId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, recieverId],
    });
  }

  const newMessage = await Message.create({
    senderId,
    recieverId,
    message,
  });

  if (newMessage) {
    conversation.messages.push(newMessage._id);
    await conversation.save();
  }

  // socket.io
  const socketId = getSocketId(recieverId);
  io.to(socketId).emit("newMessage", newMessage);

  res.status(201).json({
    success: true,
    responseData: {
      newMessage,
      conversation,
    },
  });
});

export const recieveMessage = asynchandler(async (req, res, next) => {
  const myId = req.user._id;
  const otherParticipantId = req.params.otherParticipantId;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const skip = (page - 1) * limit;

  if (!myId || !otherParticipantId) {
    return next(new errorHandler("All fields are required", 400));
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [myId, otherParticipantId] },
  });

  if (!conversation) {
    return res.status(200).json({
      success: true,
      responseData: {
        messages: [],
        totalMessages: 0,
      },
    });
  }

  const totalMessages = conversation.messages.length;

  // Fetch messages using pagination
  const messages = await Message.find({
    _id: { $in: conversation.messages },
  })
    .sort({ createdAt: -1 }) // Oldest first

    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    responseData: {
      messages,
      totalMessages,
    },
  });
});
