import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
import { io } from "../socket-server.js";
import { sendPushToUser } from "../utils/sendPushNotification.js";

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
    status: "approved",
  })
    .populate("user", "username img")
    .sort({ createdAt: 1 })
    .lean();
  const commentsAll = buildCommentTree(comments);
  res.status(200).json(commentsAll);
};
export const createNewComment = async (req, res) => {
  const user = req.dbUser;
  const newComment = new Comment({
    user: user._id,
    post: req.body.post,
    desc: req.body.desc,
    parentId: req.body.parentId,
  });
  const comment = await newComment.save();
  const post = await Post.findById(req.body.post).populate("user");
  if (!post) return res.status(404).json({ message: "Post not found" });

  // Thông báo lỗi không được làm hỏng response — bình luận đã lưu thành
  // công ở trên rồi, một lỗi ở bước báo tin không nên biến thành 500.
  try {
    // Trả lời (parentId có giá trị) -> báo cho tác giả của bình luận được
    // trả lời, vì họ mới là người cần biết. Bình luận trực tiếp vào bài ->
    // báo cho chủ bài viết. Trước đây cả 2 trường hợp đều báo cho chủ bài
    // viết, nên khi trả lời bình luận của người khác, người đó không bao
    // giờ nhận được thông báo.
    let recipient = post.user;
    let notificationType = "comment";
    let notificationMessage = `${user.username} bình luận bài viết "${post.title}"`;
    let socketMessage = `🗨️ Ai đó vừa bình luận bài "${post.title}"`;

    if (req.body.parentId) {
      const parentComment = await Comment.findById(
        req.body.parentId
      ).populate("user");
      if (parentComment) {
        recipient = parentComment.user;
        notificationType = "reply";
        notificationMessage = `${user.username} đã trả lời bình luận của bạn trong bài "${post.title}"`;
        socketMessage = `↩️ ${user.username} đã trả lời bình luận của bạn`;
      }
    }

    // Không tự báo cho chính mình (tự bình luận bài của mình, hoặc tự trả
    // lời bình luận của chính mình).
    if (recipient && recipient._id.toString() !== user._id.toString()) {
      await Notification.create({
        recipientId: recipient._id,
        type: notificationType,
        postId: req.body.post,
        commentId: comment._id,
        message: notificationMessage,
      });
      io.to(recipient.clerkUserId).emit("new-comment", {
        type: notificationType,
        postId: req.body.post,
        message: socketMessage,
      });
      await sendPushToUser(recipient._id, {
        title:
          notificationType === "reply" ? "Có người trả lời bạn" : "Bình luận mới",
        body: notificationMessage,
        url: `/posts/${post.slug}`,
      });
    }
  } catch (err) {
    console.error("Gửi thông báo bình luận thất bại:", err.message);
  }

  res.status(201).json({ comment });
};
export const deleteComment = async (req, res) => {
  const id = req.params.id;

  if (req.role === "admin") {
    await Comment.findByIdAndDelete(id);
    return res.status(200).json("Comment deleted");
  }
  const comment = await Comment.findOne({ _id: id, user: req.dbUser._id });
  if (!comment) {
    return res.status(403).json("You can delete only your comment!");
  }
  await Comment.findByIdAndDelete(id);
  res.status(200).json("Comment deleted");
};

export const likeCommentV1 = async (req, res) => {
  const id = req.body.id; // id = commentId
  try {
    const user = req.dbUser;
    if (user.likeComments.includes(id)) {
      return res.status(400).json("You already liked this comment");
    }
    await Comment.findByIdAndUpdate(id, { $inc: { like: 1 } });
    const comment = await Comment.findById(id).populate("user");
    const commentOther = await Comment.findById(id).populate("post");
    user.likeComments.push(id);
    await user.save();
    await Notification.create({
      recipientId: comment.user._id,
      type: "like",
      postId: commentOther.post._id,
      commentId: comment._id,
      message: `${user.username} like comment "${comment.desc}" in post "${commentOther.post.title}"`,
    });
    // Gửi socket real-time đến tác giả
    io.to(comment.user.clerkUserId).emit("new-like", {
      type: "like",
      postId: commentOther.post._id,
      message: `🗨️ Ai đó vừa like comment "${comment.desc}" ở bài "${commentOther.post.title}"`,
    });
    await sendPushToUser(comment.user._id, {
      title: "Lượt thích mới",
      body: `${user.username} vừa thích bình luận "${comment.desc}" của bạn`,
      url: `/posts/${commentOther.post.slug}`,
    });
    res.status(200).json("Liked comment successfully");
  } catch (err) {
    console.error(err);
    res.status(500).json("Something went wrong");
  }
};
export const disLikeCommentV1 = async (req, res) => {
  try {
    const id = req.body.id;
    const user = req.dbUser;

    if (!user.likeComments.includes(id)) {
      return res.status(400).json("You haven't liked this comment");
    }

    await Comment.findByIdAndUpdate(id, { $inc: { like: -1 } });
    user.likeComments = user.likeComments.filter((cid) => cid !== id);
    await user.save();

    res.status(200).json("Disliked comment successfully");
  } catch (err) {
    console.error(err);
    res.status(500).json("Something went wrong");
  }
};
export const likeCommentList = async (req, res) => {
  res.status(200).json(req.dbUser.likeComments);
};

export const getPendingComments = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const filter = { status: "pending" };
  const comments = await Comment.find(filter)
    .populate("user", "username img")
    .populate("post", "title slug")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  const totalComments = await Comment.countDocuments(filter);
  const hasMore = page * limit < totalComments;
  const totalPages = Math.ceil(totalComments / limit);
  res.status(200).json({ comments, hasMore, totalPages, totalComments });
};

export const approveComment = async (req, res) => {
  const comment = await Comment.findByIdAndUpdate(
    req.params.id,
    { status: "approved" },
    { new: true }
  );
  if (!comment) return res.status(404).json("Comment not found");
  res.status(200).json(comment);
};

export const hideComment = async (req, res) => {
  const comment = await Comment.findByIdAndUpdate(
    req.params.id,
    { status: "hidden" },
    { new: true }
  );
  if (!comment) return res.status(404).json("Comment not found");
  res.status(200).json(comment);
};
