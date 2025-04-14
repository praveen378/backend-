import { AccessToken } from "twilio";
import dotenv from "dotenv";
dotenv.config();

const VideoGrant = AccessToken.VideoGrant;

export const generateTwilioToken = (req, res) => {
  const { userId, roomName } = req.body;

  if (!userId || !roomName) {
    return res.status(400).json({ message: "Missing userId or roomName" });
  }

  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET,
    { identity: userId }
  );

  const videoGrant = new VideoGrant({ room: roomName });
  token.addGrant(videoGrant);

  res.json({ token: token.toJwt() });
};
