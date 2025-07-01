// cron/publishJob.js
import cron from "node-cron";
import Post from "../models/post.model.js";

cron.schedule("* * * * *", async () => {
  const now = new Date();
  const posts = await Post.find({
    isPublished: false,
    publishedAt: { $lte: now },
  });

  for (const post of posts) {
    post.isPublished = true;
    await post.save();
    console.log(`✅ Auto-published: ${post.title}`);
  }
});
