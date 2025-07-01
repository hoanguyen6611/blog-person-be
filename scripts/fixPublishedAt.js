import dotenv from "dotenv";
dotenv.config(); // ⚠️ GỌI NGAY TRÊN ĐẦU — phải gọi trước khi dùng process.env

import mongoose from "mongoose";
import Post from "../models/post.model.js";

const mongoUrl = process.env.MONGODB_URL;

if (!mongoUrl) {
  console.error("❌ MONGO_URL is not defined in .env");
  process.exit(1);
}

await mongoose.connect(mongoUrl);
console.log("✅ Mongo connected");

const posts = await Post.find();

console.log(`🔧 Found ${posts.length} post(s) to update`);

for (const post of posts) {
  post.isPublished = true;
  await post.save();
}

console.log("✅ Update complete");
process.exit(0);
