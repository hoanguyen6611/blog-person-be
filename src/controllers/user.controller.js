import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { io } from "../socket-server.js";
import mongoose from "mongoose";

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
// export const followerAuthor = async (req, res) => {
//   const clerkUserId = req.auth.userId;
//   const userId = req.body.userId;
//   if (!clerkUserId) {
//     return res.status(401).json("Not authenticated!");
//   }
//   const user = await User.findOne({ clerkUserId });
//   const isFollower = user.follower.some((p) => p === userId);

//   if (!isFollower) {
//     await User.findByIdAndUpdate(user._id, {
//       $push: { follower: userId },
//     });
//     await notificationModel.create({
//       recipientId: userId,
//       type: "user",
//       message: `${user.username} đã theo dõi bạn`,
//       userId: userId,
//     });
//     const userFollow = User.findById(userId);
//     io.to(userFollow.clerkUserId).emit("follower user", {
//       userId: userId,
//       message: `🗨️ Ai đó vừa theo dõi bạn`,
//     });
//   } else {
//     await User.findByIdAndUpdate(user._id, {
//       $pull: { follower: userId },
//     });
//   }
//   res
//     .status(200)
//     .json(
//       isFollower ? "Unfollow user successfully" : "Follower user successfully"
//     );
// };
export const followerAuthor = async (req, res) => {
  const clerkUserId = req.auth.userId;
  const userId = req.body.userId;

  if (!clerkUserId) {
    return res.status(401).json("Not authenticated!");
  }

  const user = await User.findOne({ clerkUserId });
  if (!user) return res.status(404).json("User not found!");

  const isFollower = user.follower.some((p) => p === userId);

  if (!isFollower) {
    await User.findByIdAndUpdate(user._id, {
      $push: { follower: userId },
    });
    const userFollow = await User.findById(userId);
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
  const clerkUserId = req.auth.userId;
  if (!clerkUserId) {
    return res.status(401).json("Not authenticated!");
  }
  const user = await User.findOne({ clerkUserId });

  await User.findByIdAndUpdate(user._id, {
    status: req.body.status,
  });

  res.status(200).json("Status ");
};
export const getUserSavedPosts = async (req, res) => {
  const clerkUserId = req.auth.userId;
  if (!clerkUserId) {
    return res.status(401).json("Not authenticated!");
  }
  const user = await User.findOne({ clerkUserId });
  res.status(200).json(user.savedPosts);
};
export const getUserFollow = async (req, res) => {
  const clerkUserId = req.auth.userId;
  if (!clerkUserId) {
    return res.status(401).json("Not authenticated!");
  }
  const user = await User.findOne({ clerkUserId });
  const followers = await User.find({ follower: user._id });
  const following = await User.find({ _id: { $in: user.follower } }).select(
    "username fullname img"
  );
  res.status(200).json({ followers, following });
};
export const getUserOtherFollow = async (req, res) => {
  const clerkUserId = req.auth.userId;
  const userId = req.params.id;
  if (!clerkUserId) {
    return res.status(401).json("Not authenticated!");
  }
  const user = await User.findOne({ userId });
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
  const clerkUserId = req.auth.userId;
  if (!clerkUserId) {
    return res.status(401).json("Not authenticated!");
  }
  const user = await User.findOne({ clerkUserId });
  res.status(200).json(user.likeComments);
};
export const getUserByID = async (req, res) => {
  const clerkUserId = req.auth.userId;
  if (!clerkUserId) {
    return res.status(401).json("Not authenticated!");
  }
  const user = await User.findById(req.params.id);
  res.status(200).json(user);
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
export const countNumberFollow = async (req, res) => {
  // const followerCount = await User.aggregate([
  //   { $match: { _id: new mongoose.Schema.Types.ObjectId(req.params.id) } },
  //   { $project: { count: { $size: "$follower" } } },
  // ]);
  const followers = await User.find({ follower: req.params.id });
  const followerCounts = followers.length;
  // console.log("Follower count:", followerCount[0]?.count || 0);
  res.status(200).json({ followerCounts });
};
// GET /users/followers

export const getFollowers = async (req, res) => {
  const clerkUserId = req.auth.userId;
  if (!clerkUserId) return res.status(401).json("Not authenticated!");

  const user = await User.findOne({ clerkUserId });
  if (!user) return res.status(404).json("User not found!");

  // 📌 Lấy tất cả user có follower chứa user._id
  const followerUserList = await User.find({ follower: user._id });

  res.status(200).json({ followerUserList });
};
// GET /users/following

export const getFollowing = async (req, res) => {
  const clerkUserId = req.auth.userId;
  if (!clerkUserId) return res.status(401).json("Not authenticated!");

  const user = await User.findOne({ clerkUserId });
  if (!user) return res.status(404).json("User not found!");

  // 📌 follower của user đang là 1 mảng các userId mà họ đang follow
  const following = await User.find({ _id: { $in: user.follower } }).select(
    "username fullname img"
  );

  res.status(200).json({ following });
};
export const getUserFollowList = async (req, res) => {
  const clerkUserId = req.auth.userId;
  if (!clerkUserId) {
    return res.status(401).json("Not authenticated!");
  }
  const user = await User.findOne({ clerkUserId });
  res.status(200).json(user.follower);
};
