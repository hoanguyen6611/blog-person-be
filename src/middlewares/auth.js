import User from "../models/user.model.js";

export const requireAuth = async (req, res, next) => {
  const clerkUserId = req.auth?.userId;
  if (!clerkUserId) {
    return res.status(401).json("Not authenticated");
  }
  const user = await User.findOne({ clerkUserId });
  if (!user) {
    return res.status(404).json("User not found!");
  }
  req.dbUser = user;
  req.role = req.auth.sessionClaims?.metadata?.role || "user";
  next();
};

export const requireAdmin = (req, res, next) => {
  if (req.role !== "admin") {
    return res.status(403).json("Forbidden");
  }
  next();
};
