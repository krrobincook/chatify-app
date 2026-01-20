import jwt from "jsonwebtoken";
import { ENV } from "../lib/env.js";
export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, ENV.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    sameSite: ENV.NODE_ENV !== "development" || process.env.RENDER ? "none" : "lax",
    secure: ENV.NODE_ENV !== "development" || process.env.RENDER,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};

