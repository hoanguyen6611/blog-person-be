// models/Notification.ts
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // ID người nhận
    type: {
      type: String,
      enum: ["comment", "reply", "follow", "other"],
      default: "comment",
    },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    commentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
    isRead: { type: Boolean, default: false },
    message: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
