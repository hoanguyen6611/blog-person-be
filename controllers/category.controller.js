import Category from "../models/category.model.js";

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
  const totalCategories = await Category.countDocuments();
  const hasMore = page * limit < totalCategories;
  const totalPages = Math.ceil(totalCategories / limit);
  res.status(200).json({ categories, hasMore, totalPages, totalCategories });
};
export const getCategoriesBy = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 9;
  let sortObj = { createdAt: -1 };
  const categories = await Category.find().limit(limit).sort(sortObj);
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
export const changeStatus = async (req, res) => {
  const clerkUserId = req.auth.userId;
  const categoryId = req.body.categoryId;
  if (!clerkUserId) {
    return res.status(401).json("Not authenticated");
  }
  const role = req.auth.sessionClaims?.metadata?.role || "user";
  if (role !== "admin") {
    return res.status(200).json("You cannot feature posts!");
  }
  const category = await Category.findById(categoryId);
  if (!category) {
    return res.status(400).json("Category not found");
  }
  const isStatus = category.status;
  const updateCategory = await Category.findByIdAndUpdate(
    categoryId,
    {
      status: !isStatus,
    },
    {
      new: true,
    }
  );
  res.status(200).json(updateCategory);
};
