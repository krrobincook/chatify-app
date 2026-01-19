import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";
import cookie from "cookie";

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;
    console.log("Handshake cookie:", cookieHeader);

    if (!cookieHeader) {
      return next(new Error("Unauthorized - No cookie"));
    }

    const cookies = cookie.parse(cookieHeader);
    const token = cookies.jwt;

    if (!token) {
      return next(new Error("Unauthorized - No token"));
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = user;
    socket.userId = user._id.toString();

    console.log(`Socket authenticated: ${user.fullName}`);

    next();
  } catch (error) {
    console.error("Socket auth error:", error.message);
    next(new Error("Unauthorized"));
  }
};
