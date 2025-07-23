import Tag from "../models/tag.model.js";

export const createNewTag = async (req, res) => {
  const clerkUserId = req.auth.userId;
  if (!clerkUserId) {
    return res.status(401).json("Not authenticated");
  }
  const { name } = await req.body;
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  const tag = await Tag.create({ name, slug });
  res.status(201).json(tag);
};
export const getAllNameTags = async (req, res) => {
  const tags = await Tag.find();
  const totalTags = await Tag.countDocuments();
  res.status(200).json({ tags, totalTags });
};
export const deleteTag = async (req, res) => {
  const clerkUserId = req.auth.userId;
  if (!clerkUserId) {
    return res.status(401).json("Not authenticated");
  }
  const role = req.auth.sessionClaims?.metadata?.role || "user";
  if (role !== "admin") {
    return res.status(404).json("You do not have the right to delete!!");
  }
  await Tag.findByIdAndDelete(req.params.id);
  return res.status(200).json("Delete post succesfully");
};
