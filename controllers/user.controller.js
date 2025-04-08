 import User from "../models/user.model.js";
import { asynchandler } from "../utility/asynHandler.utlity.js";
import { errorHandler } from "../utility/errorHandler.utility.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  return jwt.sign({ _id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// REGISTER USER
export const register = asynchandler(async (req, res, next) => {
  const { fullName, username, password, gender, email } = req.body;

  if (!fullName || !username || !password || !gender) {
    return next(new errorHandler("All fields are required", 400));
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return next(new errorHandler("Username already taken", 400));
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const avatarType = gender === "male" ? "boy" : "girl";
  const avatar = `https://avatar.iran.liara.run/public/${avatarType}?username=${username}`;

  const newUser = await User.create({
    fullName,
    username,
    email,
    password: hashedPassword,
    gender,
    avatar,
  });

  const token = generateToken(newUser._id);

  res
    .status(201)
    .cookie("token", token, {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .json({
      success: true,
      responseData: { newUser, token },
    });
});

// LOGIN USER
export const login = asynchandler(async (req, res, next) => {
  const { username, password } = req.body;
  console.log("login", req.body);
  if (!username || !password) {
    return next(new errorHandler("Username and password are required", 400));
  }

  const user = await User.findOne({ username });
  if (!user) {
    return next(new errorHandler("Invalid username or password", 400));
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    return next(new errorHandler("Invalid username or password", 400));
  }

  const token = generateToken(user._id);

  res
    .status(200)
    .cookie("token", token, {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .json({
      success: true,
      responseData: { user, token },
    });
});

// LOGOUT USER
export const logout = asynchandler(async (req, res, next) => {
  res
    .cookie("token", "", {
      expires: new Date(0),
      httpOnly: true,
    })
    .status(200)
    .json({
      success: true,
      message: "Logged out successfully",
    });
});

// GET USER PROFILE
export const getProfile = asynchandler(async (req, res, next) => {
  console.log("req.user", req.user);
  const profile = await User.findById(req.user._id).select("-password");

  if (!profile) {
    return next(new errorHandler("User not found", 404));
  }

  res.status(200).json({
    success: true,
    responseData: { profile },
  });
});

// Get Other  USER
export const getOtherUsers = asynchandler(async (req, res, next) => {
  const otherUsers = await User.find({ _id: { $ne: req.user._id } }).select(
    "-password"
  );

  res.status(200).json({
    success: true,
    responseData: otherUsers,
  });
});
