import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const getNotificationsByUser = async (req, res) => {
  const clerkUserId = req.auth.userId;
  if (!clerkUserId) {
    return res.status(401).json("Not authenticated");
  }
  const user = await User.findOne({ clerkUserId });
  const notifications = await Notification.find({ recipientId: user._id })
    .sort({ createdAt: -1 })
    .limit(20);

  res.json(notifications);
};
