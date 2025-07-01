import Post from "../models/post.model.js";

const increaseVisit = async (req, res, next) => {
  const id = req.params.id;

  await Post.findByIdAndUpdate({ _id: id }, { $inc: { visit: 1 } });

  next();
};

export default increaseVisit;
