import notificationModel from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
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
  if (req.role === "admin") {
    const posts = await Post.find({ isPublished: false }).populate(
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
    isPublished: false,
  }).populate("user", "username last_name first_name");
  const totalVisits = posts.reduce((sum, post) => sum + (post.visit || 0), 0);
  const totalPosts = await Post.countDocuments({
    user: req.dbUser._id,
    isPublished: false,
  });
  const hasMore = page * limit < totalPosts;
  const totalPages = Math.ceil(totalPosts / limit);
  res
    .status(200)
    .json({ posts, hasMore, totalPages, totalPosts, totalVisits });
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
  const newPost = new Post({
    user: user._id,
    slug,
    ...pickAllowedFields(req.body, ALLOWED_POST_FIELDS),
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
    if (
      req.role !== "admin" &&
      post.user.toString() !== req.dbUser._id.toString()
    ) {
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
const imagekit = new ImageKit({
  publicKey: "public_WYltmmJOZFWTLK9IloWulX5d22Q=",
  privateKey: "private_9Q2tvWScSgJG6Ou6Rne6GQN4slY=",
  urlEndpoint: "https://ik.imagekit.io/cjx1zgaos",
});
export const uploadAuth = async (req, res) => {
  const result = imagekit.getAuthenticationParameters();
  res.send({
    publicKey: imagekit.options.publicKey,
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
