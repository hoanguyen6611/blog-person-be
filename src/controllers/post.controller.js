import mongoose from "mongoose";
import notificationModel from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import PostView from "../models/postView.model.js";
import ImageKit from "imagekit";
import { io } from "../socket-server.js";

const ALLOWED_POST_FIELDS = [
  "title",
  "content",
  "desc",
  "img",
  "category",
  "tags",
  "publishedAt",
];
// Chỉ cho phép set isPublished khi TẠO bài (chủ bài viết tự chọn đăng ngay hay lưu nháp).
// Khi UPDATE, isPublished phải đi qua endpoint publish-status riêng để tránh bypass ngầm qua body.
const CREATE_ONLY_FIELDS = [...ALLOWED_POST_FIELDS, "isPublished"];

function pickAllowedFields(body, allowedFields) {
  return allowedFields.reduce((acc, field) => {
    if (body[field] !== undefined) acc[field] = body[field];
    return acc;
  }, {});
}

export const getPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const query = {
    isPublished: true,
  };
  const cat = req.query.cat;
  const author = req.query.author;
  const searchQuery = req.query.search;
  const sortQuery = req.query.sort;
  const featured = req.query.featured;
  const from = req.query.from;
  const to = req.query.to;
  if (from || to) {
    query.createdAt = {
      $gte: from,
      $lte: to,
    };
  }
  if (cat) {
    query.category = cat;
  }
  if (searchQuery) {
    query.title = { $regex: searchQuery, $options: "i" };
  }
  if (author) {
    const user = await User.findOne({ username: author }).select("_id");
    if (!user) {
      return res.status(400).json("User not found");
    }
    query.user = user._id;
  }
  let sortObj = { createdAt: -1 };
  if (sortQuery) {
    switch (sortQuery) {
      case "newest": //sort theo thu tu moi den cu - theo thu tu giam dan - ngay tao moi nhat o dau
        sortObj = { createdAt: -1 };
        break;
      case "oldest": //sort theo thu tu cu den moi - theo thu tu tang dan - ngay tao moi nhat o cuoi
        sortObj = { createdAt: 1 };
        break;
      case "popular": //sap xep theo thu tu so luot truy cap - bai viet co luot truy cap nhieu nhat o tren cung
        sortObj = { visit: -1 };
        break;
      case "trending": // tuong tu nhung chi lay nhung bai viet trong 7 ngay gan day
        sortObj = { visit: -1 };
        query.createdAt = {
          $gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
        };
        break;
      default:
        break;
    }
  }
  if (featured) {
    query.isFeature = true;
  }

  const posts = await Post.find(query)
    .populate("user", "username last_name first_name")
    .sort(sortObj)
    .limit(limit)
    .skip((page - 1) * limit);
  const totalPosts = await Post.countDocuments(query);
  const hasMore = page * limit < totalPosts;
  const totalPages = Math.ceil(totalPosts / limit);
  res.status(200).json({ posts, hasMore, totalPages, totalPosts });
};

export const sumAllPost = async (req, res) => {
  await Post.find();
  const totalPosts = await Post.countDocuments({ isPublished: true });
  res.status(200).json({ totalPosts });
};
export const sumAllPostByUser = async (req, res) => {
  if (req.role === "admin") {
    const totalPosts = await Post.countDocuments({ isPublished: true });
    return res.status(200).json({ totalPosts });
  }
  const posts = await Post.find({ user: req.dbUser._id });
  const totalVisits = posts.reduce((sum, post) => sum + (post.visit || 0), 0);
  res.status(200).json({ totalVisits });
};

export const getPostByUser = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  if (req.role === "admin") {
    const posts = await Post.find({ isPublished: true }).populate(
      "user",
      "username last_name first_name"
    );
    const totalPosts = await Post.countDocuments();
    const hasMore = page * limit < totalPosts;
    const totalPages = Math.ceil(totalPosts / limit);
    return res.status(200).json({ posts, hasMore, totalPages, totalPosts });
  }
  const posts = await Post.find({
    user: req.dbUser._id,
    isPublished: true,
  }).populate("user", "username last_name first_name");
  const totalVisits = posts.reduce((sum, post) => sum + (post.visit || 0), 0);
  const totalPosts = await Post.countDocuments({
    user: req.dbUser._id,
    isPublished: true,
  });
  const hasMore = page * limit < totalPosts;
  const totalPages = Math.ceil(totalPosts / limit);
  res
    .status(200)
    .json({ posts, hasMore, totalPages, totalPosts, totalVisits });
};
export const getPostByUserSchedule = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  // Chỉ tính bài "đã lên lịch" (có publishedAt), khác với bài nháp (publishedAt = null).
  const scheduleFilter = { isPublished: false, publishedAt: { $ne: null } };
  if (req.query.from || req.query.to) {
    scheduleFilter.publishedAt = {
      ...scheduleFilter.publishedAt,
      ...(req.query.from && { $gte: new Date(req.query.from) }),
      ...(req.query.to && { $lte: new Date(req.query.to) }),
    };
  }
  if (req.role === "admin") {
    const posts = await Post.find(scheduleFilter).populate(
      "user",
      "username last_name first_name"
    );
    const totalPosts = await Post.countDocuments(scheduleFilter);
    const hasMore = page * limit < totalPosts;
    const totalPages = Math.ceil(totalPosts / limit);
    return res.status(200).json({ posts, hasMore, totalPages, totalPosts });
  }
  const filter = { ...scheduleFilter, user: req.dbUser._id };
  const posts = await Post.find(filter).populate(
    "user",
    "username last_name first_name"
  );
  const totalVisits = posts.reduce((sum, post) => sum + (post.visit || 0), 0);
  const totalPosts = await Post.countDocuments(filter);
  const hasMore = page * limit < totalPosts;
  const totalPages = Math.ceil(totalPosts / limit);
  res
    .status(200)
    .json({ posts, hasMore, totalPages, totalPosts, totalVisits });
};
export const getUserDraftPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  // Bài nháp thật sự: chưa publish và chưa hẹn giờ đăng.
  const draftFilter = { isPublished: false, publishedAt: null };
  if (req.role !== "admin") {
    draftFilter.user = req.dbUser._id;
  }
  const posts = await Post.find(draftFilter)
    .populate("user", "username last_name first_name")
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  const totalPosts = await Post.countDocuments(draftFilter);
  const hasMore = page * limit < totalPosts;
  const totalPages = Math.ceil(totalPosts / limit);
  res.status(200).json({ posts, hasMore, totalPages, totalPosts });
};
export const getPostByUserId = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const posts = await Post.find({
    user: req.params.id,
    isPublished: true,
  }).populate("user", "username last_name first_name");
  const totalVisits = posts.reduce((sum, post) => sum + (post.visit || 0), 0);
  const totalPosts = await Post.countDocuments({
    user: req.params.id,
    isPublished: true,
  });
  const hasMore = page * limit < totalPosts;
  const totalPages = Math.ceil(totalPosts / limit);
  res.status(200).json({ posts, hasMore, totalPages, totalPosts, totalVisits });
};

export const getSumVisitPost = async (req, res) => {
  const posts = await Post.find({ isPublished: true });
  const totalVisits = posts.reduce((sum, post) => sum + (post.visit || 0), 0);
  res.status(200).json({ totalVisits });
};
export const getPost = async (req, res) => {
  const post = await Post.findById(req.params.id).populate(
    "user",
    "username img last_name first_name"
  );
  res.status(200).json(post);
};

export const createNewPost = async (req, res) => {
  const user = req.dbUser;
  let slug = req.body.title.replace(/ /g, "-").toLowerCase();
  let existingPost = await Post.findOne({ slug });
  let counter = 2;
  while (existingPost) {
    slug = `${slug}-${counter}`;
    existingPost = await Post.findOne({ slug });
    counter++;
  }
  const fields = pickAllowedFields(req.body, CREATE_ONLY_FIELDS);
  if (fields.isPublished && !fields.publishedAt) {
    fields.publishedAt = new Date();
  }
  const newPost = new Post({
    user: user._id,
    slug,
    ...fields,
  });
  const post = await newPost.save();
  const followers = await User.find({ follower: user._id });
  await Promise.all(
    followers.map(async (follower) => {
      await notificationModel.create({
        recipientId: follower._id,
        type: "post",
        postId: post._id,
        message: `${user.username} published a new post "${post.title}"`,
      });
      // Gửi socket real-time đến follower
      io.to(follower.clerkUserId).emit("new-post", {
        type: "post",
        postId: post._id,
        message: `📝 ${user.username} vừa đăng bài viết mới "${post.title}"`,
      });
    })
  );
  res.status(201).json(post);
};
export const updatePost = async (req, res) => {
  const postId = req.params.id;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json("Post not found!");
    }
    if (!assertOwnerOrAdmin(post, req)) {
      return res.status(403).json("You can update only your post!");
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      pickAllowedFields(req.body, ALLOWED_POST_FIELDS),
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
function assertOwnerOrAdmin(post, req) {
  return req.role === "admin" || post.user.toString() === req.dbUser._id.toString();
}

export const setPostPublishStatus = async (req, res) => {
  const postId = req.params.id;
  const isPublished = !!req.body.isPublished;
  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json("Post not found!");
  }
  if (!assertOwnerOrAdmin(post, req)) {
    return res.status(403).json("You can update only your post!");
  }
  const update = { isPublished };
  if (isPublished && !post.publishedAt) {
    update.publishedAt = new Date();
  }
  const updatedPost = await Post.findByIdAndUpdate(postId, update, {
    new: true,
  });
  res.status(200).json(updatedPost);
};

export const schedulePost = async (req, res) => {
  const postId = req.params.id;
  const { publishedAt } = req.body;
  if (!publishedAt) {
    return res.status(400).json("publishedAt is required");
  }
  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json("Post not found!");
  }
  if (!assertOwnerOrAdmin(post, req)) {
    return res.status(403).json("You can update only your post!");
  }
  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    { publishedAt: new Date(publishedAt) },
    { new: true }
  );
  res.status(200).json(updatedPost);
};

export const deletePost = async (req, res) => {
  const postId = req.params.id;
  if (req.role === "admin") {
    await Post.findByIdAndDelete(postId);
    return res.status(200).json("Delete post succesfully");
  }
  const post = await Post.findOne({ _id: postId, user: req.dbUser._id });
  if (!post) {
    return res.status(403).json("You can delete only your post!");
  }
  await Post.findByIdAndDelete(postId);
  res.status(200).json("Delete post succesfully");
};

function parsePostIds(body) {
  const ids = Array.isArray(body.postIds) ? body.postIds : [];
  return ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
}

export const bulkChangeCategory = async (req, res) => {
  const postIds = parsePostIds(req.body);
  const category = req.body.category;
  if (!postIds.length || !category) {
    return res.status(400).json("postIds and category are required");
  }
  const result = await Post.updateMany(
    { _id: { $in: postIds } },
    { category }
  );
  res.status(200).json({ matched: result.matchedCount, modified: result.modifiedCount });
};

export const bulkAddTags = async (req, res) => {
  const postIds = parsePostIds(req.body);
  const tags = Array.isArray(req.body.tags) ? req.body.tags : [];
  if (!postIds.length || !tags.length) {
    return res.status(400).json("postIds and tags are required");
  }
  const result = await Post.updateMany(
    { _id: { $in: postIds } },
    { $addToSet: { tags: { $each: tags } } }
  );
  res.status(200).json({ matched: result.matchedCount, modified: result.modifiedCount });
};

export const bulkSetPublishStatus = async (req, res) => {
  const postIds = parsePostIds(req.body);
  const isPublished = !!req.body.isPublished;
  if (!postIds.length) {
    return res.status(400).json("postIds is required");
  }
  const update = { isPublished };
  if (isPublished) {
    // Chỉ set publishedAt cho bài chưa có, không ghi đè lịch đã hẹn.
    await Post.updateMany(
      { _id: { $in: postIds }, publishedAt: null },
      { publishedAt: new Date() }
    );
  }
  const result = await Post.updateMany({ _id: { $in: postIds } }, update);
  res.status(200).json({ matched: result.matchedCount, modified: result.modifiedCount });
};

export const bulkDeletePosts = async (req, res) => {
  const postIds = parsePostIds(req.body);
  if (!postIds.length) {
    return res.status(400).json("postIds is required");
  }
  const result = await Post.deleteMany({ _id: { $in: postIds } });
  res.status(200).json({ deleted: result.deletedCount });
};

let imagekit;
function getImageKit() {
  if (!imagekit) {
    imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  }
  return imagekit;
}
export const uploadAuth = async (req, res) => {
  const ik = getImageKit();
  const result = ik.getAuthenticationParameters();
  res.send({
    publicKey: ik.options.publicKey,
    ...result,
  });
};
export const featurePost = async (req, res) => {
  const postId = req.body.postId;
  const post = await Post.findById(postId);
  if (!post) {
    return res.status(400).json("Post not found");
  }
  const isFeature = post.isFeature;
  const updatePost = await Post.findByIdAndUpdate(
    postId,
    {
      isFeature: !isFeature,
    },
    {
      new: true,
    }
  );
  res.status(200).json(updatePost);
};
export const statistic = async (req, res) => {
  const totalPosts = await Post.countDocuments({ isPublished: true });

  const postsByMonth = await Post.aggregate([
    {
      $group: {
        _id: { $substr: ["$createdAt", 0, 7] }, // YYYY-MM
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const postsByCategory = await Post.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ]);

  const postsByAuthor = await Post.aggregate([
    {
      $group: {
        _id: "$user", // hoặc $userId
        count: { $sum: 1 },
      },
    },
  ]);
  const topPosts = await Post.find({ isPublished: true })
    .sort({ views: -1 })
    .limit(5)
    .select("title visit slug _id img")
    .lean();
  const monthlyVisit = await Post.aggregate([
    {
      $match: {
        isPublished: true, // (nếu chỉ tính bài đã đăng)
      },
    },
    {
      $group: {
        // _id: {
        //   year: { $year: "$createdAt" },
        //   month: { $month: "$createdAt" },
        // },
        _id: { $substr: ["$createdAt", 0, 7] },
        count: { $sum: "$visit" },
        // count: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": -1, "_id.month": -1 }, // sắp xếp theo thời gian giảm dần
    },
  ]);

  res.status(200).json({
    totalPosts,
    postsByMonth,
    postsByCategory,
    postsByAuthor,
    topPosts,
    monthlyVisit,
  });
};

export const getTrafficStats = async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const now = new Date();
  const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const prevPeriodStart = new Date(
    periodStart.getTime() - days * 24 * 60 * 60 * 1000
  );

  const [totalViews, previousPeriodViews, dailyViewsRaw, uniqueVisitorIds] =
    await Promise.all([
      PostView.countDocuments({ createdAt: { $gte: periodStart, $lte: now } }),
      PostView.countDocuments({
        createdAt: { $gte: prevPeriodStart, $lt: periodStart },
      }),
      PostView.aggregate([
        { $match: { createdAt: { $gte: periodStart, $lte: now } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      PostView.distinct("visitorId", {
        createdAt: { $gte: periodStart, $lte: now },
      }),
    ]);

  const returningVisitorIds = await PostView.distinct("visitorId", {
    visitorId: { $in: uniqueVisitorIds },
    createdAt: { $lt: periodStart },
  });

  const trendPercent =
    previousPeriodViews === 0
      ? totalViews > 0
        ? 100
        : 0
      : Math.round(((totalViews - previousPeriodViews) / previousPeriodViews) * 1000) / 10;

  const returningRatePercent =
    uniqueVisitorIds.length === 0
      ? 0
      : Math.round((returningVisitorIds.length / uniqueVisitorIds.length) * 1000) / 10;

  res.status(200).json({
    period: { days, from: periodStart, to: now },
    totalViews,
    previousPeriodViews,
    trendPercent,
    uniqueVisitors: uniqueVisitorIds.length,
    returningVisitors: returningVisitorIds.length,
    returningRatePercent,
    dailyViews: dailyViewsRaw.map((d) => ({ date: d._id, count: d.count })),
  });
};

export const relatedPosts = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).lean();
    if (!post) return res.status(404).json({ message: "Not found" });

    const titleKeywords = post.title
      .split(" ")
      .slice(0, 4)
      .map((word) => word.trim())
      .filter((word) => word.length > 2)
      .join("|");

    const relatedPosts = await Post.find({
      _id: { $ne: post._id },
      isPublished: true,
      $or: [
        { category: post.category },
        { tags: { $in: post.tags || [] } },
        { title: { $regex: titleKeywords, $options: "i" } },
      ],
    })
      .sort({ views: -1, createdAt: -1 })
      .limit(6)
      .select("title slug img createdAt")
      .lean();

    return res.json({ post, relatedPosts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
