import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const getNotificationsByUserLimit = async (req, res) => {
  const clerkUserId = req.auth.userId;
  if (!clerkUserId) {
    return res.status(401).json("Not authenticated");
  }
  const user = await User.findOne({ clerkUserId });
  const notifications = await Notification.find({ recipientId: user._id })
    .sort({ createdAt: -1 })
    .limit(8);

  res.json(notifications);
};
export const getNotificationsByUser = async (req, res) => {
  const clerkUserId = req.auth.userId;
  if (!clerkUserId) {
    return res.status(401).json("Not authenticated");
  }
  const user = await User.findOne({ clerkUserId });
  const notifications = await Notification.find({ recipientId: user._id }).sort(
    { createdAt: -1 }
  );

  res.json(notifications);
};
export const markNotificationAsRead = async (req, res) => {
  const clerkUserId = req.auth.userId;
  if (!clerkUserId) {
    return res.status(401).json("Not authenticated");
  }
  const notificationId = req.params.id;
  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      res.status(404).json({ message: "Notification not found" });
    }
    return res.status(200).json(notification);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const markAllAsRead = async (req, res) => {
  const clerkUserId = req.auth.userId;
  if (!clerkUserId) {
    return res.status(401).json("Not authenticated");
  }
  const user = await User.findOne({ clerkUserId });
  await Notification.updateMany(
    { recipientId: user._id, isRead: false },
    { isRead: true }
  );

  res.status(200).json({ message: "All notifications marked as read" });
};
