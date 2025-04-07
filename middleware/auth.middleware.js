import { asynchandler } from "../utility/asynHandler.utlity.js";
import { errorHandler } from "../utility/errorHandler.utility.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = asynchandler(async (req, res, next) => {
  const token =
    req.cookies.token || req.headers["authorization"]?.replace("Bearer ", "");

  if (!token) {
    return next(new errorHandler("Please login First", 401));
  }
  const tokenData = jwt.verify(token, process.env.JWT_SECRET);

  req.user = tokenData;

  next();
});
