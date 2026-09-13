import Subscriber from "../models/subscriber.model.js";
import {
  getTrendingPosts,
  sendDigestToSubscribers,
} from "../utils/newsletterDigest.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const subscribeNewsletter = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json("Email không hợp lệ");
  }

  const existing = await Subscriber.findOne({ email });
  if (existing) {
    if (!existing.isActive) {
      existing.isActive = true;
      await existing.save();
    }
    return res.status(200).json({ message: "Đăng ký thành công" });
  }

  await Subscriber.create({ email });
  res.status(201).json({ message: "Đăng ký thành công" });
};

export const getSubscribers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const search = req.query.search?.trim();
  const filter = search ? { email: { $regex: search, $options: "i" } } : {};

  const subscribers = await Subscriber.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  const totalSubscribers = await Subscriber.countDocuments(filter);
  const activeSubscribers = await Subscriber.countDocuments({
    isActive: true,
  });
  const hasMore = page * limit < totalSubscribers;
  const totalPages = Math.ceil(totalSubscribers / limit);
  res.status(200).json({
    subscribers,
    hasMore,
    totalPages,
    totalSubscribers,
    activeSubscribers,
  });
};

export const toggleSubscriberStatus = async (req, res) => {
  const subscriber = await Subscriber.findById(req.params.id);
  if (!subscriber) {
    return res.status(404).json({ message: "Subscriber not found" });
  }
  subscriber.isActive = !subscriber.isActive;
  await subscriber.save();
  res.status(200).json(subscriber);
};

export const deleteSubscriber = async (req, res) => {
  const subscriber = await Subscriber.findByIdAndDelete(req.params.id);
  if (!subscriber) {
    return res.status(404).json({ message: "Subscriber not found" });
  }
  res.status(200).json({ message: "Đã xoá người đăng ký" });
};

// Cho admin xem trước 3 bài sẽ được gửi trước khi bấm "Gửi ngay".
export const previewDigest = async (req, res) => {
  const posts = await getTrendingPosts();
  const activeSubscribers = await Subscriber.countDocuments({
    isActive: true,
  });
  res.status(200).json({ posts, activeSubscribers });
};

// Kích hoạt gửi bản tin ngay (dùng để test, hoặc gửi bù nếu cron bỏ lỡ) —
// dùng chung logic chọn bài + gửi với cron job hàng tuần.
export const sendDigestNow = async (req, res) => {
  const result = await sendDigestToSubscribers();
  if (result.skipped) {
    return res.status(400).json({ message: result.reason, ...result });
  }
  res.status(200).json(result);
};

// Huỷ đăng ký qua link trong email — public vì người bấm chưa đăng nhập,
// nhưng chỉ ảnh hưởng đúng 1 subscriber theo _id (ObjectId không thể đoán
// được), không phải theo email.
export const unsubscribe = async (req, res) => {
  const subscriber = await Subscriber.findById(req.params.id);
  if (!subscriber) {
    return res.status(404).json({ message: "Subscriber not found" });
  }
  subscriber.isActive = false;
  await subscriber.save();
  res.status(200).json({ message: "Đã huỷ đăng ký" });
};
