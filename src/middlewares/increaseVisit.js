import Post from "../models/post.model.js";
import PostView from "../models/postView.model.js";

const increaseVisit = async (req, res, next) => {
  const id = req.params.id;

  await Post.findByIdAndUpdate(id, { $inc: { visit: 1 } });
  if (req.visitorId) {
    await PostView.create({ post: id, visitorId: req.visitorId });
  }

  next();
};

export default increaseVisit;
