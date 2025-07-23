import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    fullname: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    img: {
      type: String,
    },
    status: {
      type: String,
      default: "",
    },
    savedPosts: {
      type: [String],
      default: [],
    },
    likeComments: {
      type: [String],
      default: [],
    },
    follower: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
