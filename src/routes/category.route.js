import express from "express";
import {
  changeStatus,
  createNewCategory,
  deleteCategory,
  getAllCategories,
  getCategories,
  getCategoriesBy,
} from "../controllers/category.controller.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";
const categoryRouter = express.Router();

categoryRouter.post("/", requireAuth, createNewCategory);
categoryRouter.get("/", getCategories);
categoryRouter.get("/all", getAllCategories);
categoryRouter.get("/getLimit", getCategoriesBy);
categoryRouter.delete("/:id", requireAuth, requireAdmin, deleteCategory);
categoryRouter.patch(
  "/changeStatus/:id",
  requireAuth,
  requireAdmin,
  changeStatus
);

export default categoryRouter;
