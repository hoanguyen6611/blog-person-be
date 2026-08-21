import Notification from "../models/notification.model.js";

export const getNotificationsByUserLimit = async (req, res) => {
  const notifications = await Notification.find({
    recipientId: req.dbUser._id,
  })
    .sort({ createdAt: -1 })
    .limit(8);

  res.json(notifications);
};
export const getNotificationsByUser = async (req, res) => {
  const notifications = await Notification.find({
    recipientId: req.dbUser._id,
  }).sort({ createdAt: -1 });

  res.json(notifications);
};
export const markNotificationAsRead = async (req, res) => {
  const notificationId = req.params.id;
  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    return res.status(200).json(notification);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const markAllAsRead = async (req, res) => {
  await Notification.updateMany(
    { recipientId: req.dbUser._id, isRead: false },
    { isRead: true }
  );

  res.status(200).json({ message: "All notifications marked as read" });
};
