import express from "express";
import {
  changeStatus,
  createNewCategory,
  deleteCategory,
  getAllCategories,
  getCategories,
  getCategoriesBy,
} from "../controllers/category.controller.js";
const categoryRouter = express.Router();

categoryRouter.post("/", createNewCategory);
categoryRouter.get("/", getCategories);
categoryRouter.get("/all", getAllCategories);
categoryRouter.get("/getLimit", getCategoriesBy);
categoryRouter.delete("/:id", deleteCategory);
categoryRouter.patch("/changeStatus/:id", changeStatus);

export default categoryRouter;
