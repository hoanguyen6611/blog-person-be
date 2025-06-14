import Post from "../models/post.model.js";
import User from "../models/user.model.js";

export const savedPost = async (req, res) => {
  const clerkUserId = req.auth.userId;
  const postId = req.body.postId;
  if (!clerkUserId) {
    return res.status(401).json("Not authenticated!");
  }
  const user = await User.findOne({ clerkUserId });
  const isSaved = user.savedPosts.some((p) => p === postId);

  if (!isSaved) {
    await User.findByIdAndUpdate(user._id, {
      $push: { savedPosts: postId },
    });
  } else {
    await User.findByIdAndUpdate(user._id, {
      $pull: { savedPosts: postId },
    });
  }

  res
    .status(200)
    .json(isSaved ? "Unsave post successfully" : "Save post successfully");
};
export const getUserSavedPosts = async (req, res) => {
  const clerkUserId = req.auth.userId;

  if (!clerkUserId) {
    return res.status(401).json("Not authenticated!");
  }

  const user = await User.findOne({ clerkUserId });

  res.status(200).json(user.savedPosts);
};
export const getUserSavedPostsInfor = async (req, res) => {
  const clerkUserId = req.auth.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  if (!clerkUserId) {
    return res.status(401).json("Not authenticated!");
  }
  const user = await User.findOne({ clerkUserId });
  const savedPost = user.savedPosts;

  const postAll = await Post.find().populate("user", "username");
  const posts = postAll.filter((post) => savedPost.includes(post._id));
  const totalPosts = posts.length;
  const hasMore = page * limit < totalPosts;
  const totalPages = Math.ceil(totalPosts / limit);
  res.status(200).json({ posts, hasMore, totalPages, totalPosts });
};
export const sumAllUser = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const clerkUserId = req.auth.userId;
  const role = req.auth.sessionClaims?.metadata?.role || "user";
  if (!clerkUserId) {
    return res.status(401).json("Not authenticated");
  }
  if (role === "admin") {
    const users = await User.find().select("username email img createdAt");
    const totalUsers = await User.countDocuments();
    const hasMore = page * limit < totalUsers;
    const totalPages = Math.ceil(totalUsers / limit);
    res.status(200).json({ users, hasMore, totalPages, totalUsers });
  }
};
