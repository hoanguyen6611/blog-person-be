import Tag from "../models/tag.model.js";

export const createNewTag = async (req, res) => {
  const clerkUserId = req.auth.userId;
  if (!clerkUserId) {
    return res.status(401).json("Not authenticated");
  }
  const { name } = await req.body;
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  const tag = await Tag.create({ name, slug });
  res.status(200).json(tag);
};
export const getAllNameTags = async (req, res) => {
  const tags = await Tag.find();
  const totalTags = await Tag.countDocuments();
  res.status(200).json({ tags, totalTags });
};
