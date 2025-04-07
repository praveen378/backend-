import Message from "../models/message.model.js";

import { asynchandler } from "../utility/asynHandler.utlity.js";

// ✅ Update all messages from a sender to a receiver (e.g., mark all as read)
export const updateMessagesStatusBySender = asynchandler(async (req, res) => {
  const { senderId, receiverId } = req.params;
  const { status } = req.body;

  try {
    const result = await Message.updateMany(
      {
        senderId,
        recieverId: receiverId,
        status: { $ne: "read" }, // Only update if not already read
      },
      {
        $set: { status: "read" },
      }
    );

    res.status(200).json({ message: "Messages updated", result });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});
