import Subscriber from "../models/subscriber.model.js";

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
