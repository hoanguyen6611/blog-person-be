import Category from "../models/category.model.js";

export const createNewCategory = async (req, res) => {
  const newCategory = new Category({ title: req.body.title });
  const category = await newCategory.save();
  res.status(201).json(category);
};
export const getCategories = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const categories = await Category.find({ status: true });
  const totalCategories = await Category.countDocuments();
  const hasMore = page * limit < totalCategories;
  const totalPages = Math.ceil(totalCategories / limit);
  res.status(200).json({ categories, hasMore, totalPages, totalCategories });
};
export const getAllCategories = async (req, res) => {
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
  const limit = parseInt(req.query.limit) || 20;
  let sortObj = { createdAt: -1 };
  const categories = await Category.find().limit(limit).sort(sortObj);
  const totalCategories = await Category.countDocuments();
  const hasMore = page * limit < totalCategories;
  const totalPages = Math.ceil(totalCategories / limit);
  res.status(200).json({ categories, hasMore, totalPages });
};
export const deleteCategory = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  return res.status(200).json("Delete category succesfully");
};
export const changeStatus = async (req, res) => {
  const categoryId = req.body.categoryId;
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
