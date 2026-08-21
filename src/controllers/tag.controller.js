import Tag from "../models/tag.model.js";

export const createNewTag = async (req, res) => {
  const { name } = req.body;
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
  await Tag.findByIdAndDelete(req.params.id);
  return res.status(200).json("Delete tag succesfully");
};
