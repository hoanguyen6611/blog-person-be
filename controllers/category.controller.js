import Category from "../models/category.model.js";
import userModel from "../models/user.model.js";

export const createNewCategory = async (req, res) => {
  const clerkUserId = req.auth.userId;
  if (!clerkUserId) {
    return res.status(401).json("Not authenticated");
  }
  const newCategory = new Category({ ...req.body });
  const category = await newCategory.save();
  res.status(200).json(category);
};
export const getCategories = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const categories = await Category.find();
  // .populate('user', 'username last_name first_name')
  // .sort(sortObj)
  // .limit(limit)
  // .skip((page - 1) * limit);
  const totalCategories = await Category.countDocuments();
  const hasMore = page * limit < totalCategories;
  const totalPages = Math.ceil(totalCategories / limit);
  res.status(200).json({ categories, hasMore, totalPages });
};
export const deleteCategory = async (req, res) => {
  const clerkUserId = req.auth.userId;
  if (!clerkUserId) {
    return res.status(401).json("Not authenticated");
  }
  const role = req.auth.sessionClaims?.metadata?.role || "user";
  if (role !== "admin") {
    return res.status(404).json("You do not have the right to delete!!");
  }
  await Category.findByIdAndDelete(req.params.id);
  return res.status(200).json("Delete post succesfully");
};
