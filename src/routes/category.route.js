import express from "express";
import {
  changeStatus,
  createNewCategory,
  deleteCategory,
  getAllCategories,
  getCategories,
  getCategoriesBy,
} from "../controllers/category.controller.js";
const router = express.Router();

router.post("/", createNewCategory);
router.get("/", getCategories);
router.get("/all", getAllCategories);
router.get("/getLimit", getCategoriesBy);
router.delete("/:id", deleteCategory);
router.patch("/changeStatus/:id", changeStatus);

export default router;
