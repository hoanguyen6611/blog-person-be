import dotenv from "dotenv";
dotenv.config(); // ⚠️ GỌI NGAY TRÊN ĐẦU — phải gọi trước khi dùng process.env

import mongoose from "mongoose";
import Comment from "../src/models/comment.model.js";

const mongoUrl = process.env.MONGODB_URL;

if (!mongoUrl) {
  console.error("❌ MONGO_URL is not defined in .env");
  process.exit(1);
}

await mongoose.connect(mongoUrl);
console.log("✅ Mongo connected");

const comments = await Comment.find();

console.log(`🔧 Found ${comments.length} post(s) to update`);

for (const comment of comments) {
  comment.likeComment = ["682c3dc353957069575736b2"];
  await comment.save();
}

console.log("✅ Update complete");
process.exit(0);
