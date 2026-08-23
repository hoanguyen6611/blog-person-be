import mongoose from "mongoose";

const postViewSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    visitorId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

postViewSchema.index({ post: 1, createdAt: -1 });
postViewSchema.index({ visitorId: 1, createdAt: -1 });
postViewSchema.index({ createdAt: -1 });

export default mongoose.model("PostView", postViewSchema);
