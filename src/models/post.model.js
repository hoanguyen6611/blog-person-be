import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    img: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    desc: {
      type: String,
    },
    content: {
      type: String,
      required: true,
    },
    isFeature: {
      type: Boolean,
      default: false,
    },
    visit: {
      type: Number,
      default: 0,
    },
    publishedAt: { type: Date, default: Date.now }, // Ngày giờ publish
    isPublished: { type: Boolean, default: false }, // Đã đăng chưa
  },
  { timestamps: true }
);
postSchema.index({ title: "text" }); // full-text search
postSchema.index({ category: "general" });
postSchema.index({ createdAt: -1 });
postSchema.index({ visit: -1 });

export default mongoose.model("Post", postSchema);
