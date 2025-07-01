import notificationModel from "../models/notification.model.js";
import User from "../models/user.model.js";
import { io } from "../socket-server.js";

/**
 * Gửi thông báo + socket cho user
 * @param {Object} params
 * @param {String} params.recipientId - MongoDB _id của người nhận
 * @param {String} params.message - Nội dung hiển thị
 * @param {String} [params.type] - Loại thông báo (ví dụ: "comment", "user")
 * @param {String} [params.postId] - Nếu liên quan đến bài viết
 * @param {String} [params.commentId] - Nếu liên quan đến bình luận
 */
export const notifyUser = async ({
  recipientId,
  message,
  type = "general",
  postId = null,
  commentId = null,
}) => {
  if (!recipientId) return;

  const recipient = await User.findById(recipientId);
  if (!recipient?.clerkUserId) return;

  // Lưu vào DB
  await notificationModel.create({
    recipientId,
    type,
    message,
    postId,
    commentId,
  });

  // Gửi socket real-time
  io.to(recipient.clerkUserId).emit("notification", {
    type,
    message,
    postId,
    commentId,
  });
};
