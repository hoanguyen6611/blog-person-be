import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { io } from "../socket-server.js";

function buildCommentTree(flatComments) {
  const map = {};
  const roots = [];

  flatComments.forEach((comment) => {
    comment.replies = [];
    map[comment._id] = comment;
  });

  flatComments.forEach((comment) => {
    if (comment.parentId) {
      const parent = map[comment.parentId];
      if (parent) parent.replies.push(comment);
    } else {
      roots.push(comment);
    }
  });

  return roots;
}
export const getCommentByPost = async (req, res) => {
  // const page = parseInt(req.query.page) || 1;
  // const limit = parseInt(req.query.limit) || 5;

  // const comments = await Comment.find()
  //     .populate('user')
  //     .limit(limit)
  //     .skip((page - 1) * limit);
  // const totalComments = await Comment.countDocuments();
  // const hasMore = page * limit < totalComments;
  const comments = await Comment.find({
    post: req.params.postId,
  })
    .populate("user", "username img")
    .sort({ createdAt: 1 })
    .lean();
  const commentsAll = buildCommentTree(comments);
  res.status(200).json(commentsAll);
};
export const getComment = async (req, res) => {
  const post = await Comment.findOne({ slug: req.params.slug }).populate(
    "user"
  );
  res.status(200).json(post);
};
export const createNewComment = async (req, res) => {
  const clerkUserId = req.auth.userId;
  if (!clerkUserId) {
    return res.status(401).json("Not authenticated");
  }
  const user = await User.findOne({ clerkUserId });
  if (!user) {
    return res.status(404).json("User not found!");
  }
  const newComment = new Comment({ user: user._id, ...req.body });
  const comment = await newComment.save();
  const post = await Post.findById(req.body.post).populate("user");
  if (!post) return res.status(404).json({ message: "Post not found" });
  await Notification.create({
    recipientId: post.user._id,
    type: "comment",
    postId: req.body.post,
    commentId: comment._id,
    message: `${user.username} bình luận bài viết "${post.title}"`,
  });

  // Gửi socket real-time đến tác giả
  io.to(post.user.clerkUserId).emit("new-comment", {
    postId: req.body.post,
    message: `🗨️ Ai đó vừa bình luận bài "${post.title}"`,
  });
  // socket.emit("new-comment", {
  //   postId: req.body.post,
  //   message: `🗨️ Ai đó vừa bình luận bài "${post.title}"`,
  // });
  // notifyUser(
  //   post.user._id,
  //   `${user.username} bình luận bài viết "${post.title}"`,
  //   "comment",
  //   req.body.post,
  //   comment._id
  // );

  res.status(201).json({ comment });
};
export const deleteComment = async (req, res) => {
  const clerkUserId = req.auth.userId;
  const id = req.params.id;

  if (!clerkUserId) {
    return res.status(401).json("Not authenticated!");
  }
  const role = req.auth.sessionClaims?.metadata?.role || "user";
  if (role === "admin") {
    await Comment.findByIdAndDelete(id);
    return res.status(200).json("Comment deleted");
  }
  const user = User.findOne({ clerkUserId });
  const deleteComment = await Comment.findByIdAndDelete({
    _id: id,
    user: user._id,
  });
  if (!deleteComment) {
    return res.status(403).json("You can delete only your comment!");
  }
  res.status(200).json("Comment deleted");
};
export const likeComment = async (req, res) => {
  const clerkUserId = req.auth.userId;
  const commentId = req.body.id;

  if (!clerkUserId) return res.status(401).json("Not authenticated");

  try {
    const user = await User.findOne({ clerkUserId });
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json("Comment not found");

    const alreadyLiked = user.likeComments.includes(commentId);
    if (alreadyLiked) {
      await User.findByIdAndUpdate(user._id, {
        $pull: { likeComments: commentId },
      });

      // Giảm số lượng like
      const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { $inc: { like: -1 } },
        { new: true }
      );

      res.status(200).json(updatedComment);
    }

    // Thêm vào danh sách like của user
    await User.findByIdAndUpdate(user._id, {
      $push: { likeComments: commentId },
    });

    // Tăng số lượng like
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { $inc: { like: 1 } },
      { new: true }
    );

    res.status(200).json(updatedComment);
  } catch (error) {
    console.error("Error liking comment:", error);
    res.status(500).json("Internal server error");
  }
};
export const disLikeComment = async (req, res) => {
  const clerkUserId = req.auth.userId;
  const commentId = req.body.id;

  if (!clerkUserId) return res.status(401).json("Not authenticated");

  try {
    const user = await User.findOne({ clerkUserId });
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json("Comment not found");

    const alreadyLiked = user.likeComments.includes(commentId);
    if (!alreadyLiked) {
      return res.status(400).json("You haven't liked this comment yet");
    }

    // Gỡ like khỏi danh sách user
    await User.findByIdAndUpdate(user._id, {
      $pull: { likeComments: commentId },
    });

    // Giảm số lượng like
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { $inc: { like: -1 } },
      { new: true }
    );

    res.status(200).json(updatedComment);
  } catch (error) {
    console.error("Error unliking comment:", error);
    res.status(500).json("Internal server error");
  }
};
