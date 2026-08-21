import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { io } from "../socket-server.js";
import mongoose from "mongoose";

export const savedPost = async (req, res) => {
  const user = req.dbUser;
  const postId = req.body.postId;
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
export const followerAuthor = async (req, res) => {
  const user = req.dbUser;
  const userId = req.body.userId;

  const isFollower = user.follower.some((p) => p === userId);

  if (!isFollower) {
    const userFollow = await User.findById(userId);
    if (!userFollow) return res.status(404).json("User not found!");

    await User.findByIdAndUpdate(user._id, {
      $push: { follower: userId },
    });
    await Notification.create({
      recipientId: userFollow._id,
      type: "follow",
      message: `${user.username} theo dõi bạn`,
    });
    io.to(userFollow.clerkUserId).emit("new-follow", {
      type: "follow",
      message: `🗨️ ${user.username} vừa theo dõi bạn`,
    });
  } else {
    await User.findByIdAndUpdate(user._id, {
      $pull: { follower: userId },
    });
  }

  res
    .status(200)
    .json(
      isFollower ? "Unfollow user successfully" : "Follow user successfully"
    );
};
export const updateStatus = async (req, res) => {
  await User.findByIdAndUpdate(req.dbUser._id, {
    status: req.body.status,
  });

  res.status(200).json("Status updated");
};
export const getUserSavedPosts = async (req, res) => {
  res.status(200).json(req.dbUser.savedPosts);
};
export const getUserFollow = async (req, res) => {
  const user = req.dbUser;
  const followers = await User.find({ follower: user._id });
  const following = await User.find({ _id: { $in: user.follower } }).select(
    "username fullname img"
  );
  res.status(200).json({ followers, following });
};
export const getUserOtherFollow = async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json("User not found!");
  const followers = await User.find({ follower: userId });
  const following = await User.find({ _id: { $in: user.follower } }).select(
    "username fullname img"
  );
  res.status(200).json({ followers, following });
};

export const getFollowersAndFollowing = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✨ Danh sách người bạn đang theo dõi (from field `follower`)
    const followingUsers = await User.find({
      _id: { $in: user.follower.map((id) => new mongoose.Types.ObjectId(id)) },
    }).select("username email img");

    // ✨ Danh sách người theo dõi bạn (họ có bạn trong follower của họ)
    const followerUsers = await User.find({
      follower: id,
    }).select("username email img");

    res.status(200).json({
      following: followingUsers,
      followers: followerUsers,
    });
  } catch (error) {
    console.error("Error getFollowersAndFollowing:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getUserLikeComments = async (req, res) => {
  res.status(200).json(req.dbUser.likeComments);
};
export const getUserByID = async (req, res) => {
  const user = await User.findById(req.params.id);
  res.status(200).json(user);
};
export const getUserSavedPostsInfor = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const savedPostIds = req.dbUser.savedPosts;

  const filter = { _id: { $in: savedPostIds } };
  const totalPosts = await Post.countDocuments(filter);
  const posts = await Post.find(filter)
    .populate("user", "username")
    .skip((page - 1) * limit)
    .limit(limit);
  const hasMore = page * limit < totalPosts;
  const totalPages = Math.ceil(totalPosts / limit);
  res.status(200).json({ posts, hasMore, totalPages, totalPosts });
};
export const sumAllUser = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const users = await User.find().select("username email img createdAt");
  const totalUsers = await User.countDocuments();
  const hasMore = page * limit < totalUsers;
  const totalPages = Math.ceil(totalUsers / limit);
  res.status(200).json({ users, hasMore, totalPages, totalUsers });
};
export const countNumberFollow = async (req, res) => {
  const followers = await User.find({ follower: req.params.id });
  const followerCounts = followers.length;
  res.status(200).json({ followerCounts });
};
// GET /users/followers

export const getFollowers = async (req, res) => {
  const followerUserList = await User.find({ follower: req.dbUser._id });
  res.status(200).json({ followerUserList });
};
// GET /users/following

export const getFollowing = async (req, res) => {
  const following = await User.find({
    _id: { $in: req.dbUser.follower },
  }).select("username fullname img");

  res.status(200).json({ following });
};
export const getUserFollowList = async (req, res) => {
  res.status(200).json(req.dbUser.follower);
};
