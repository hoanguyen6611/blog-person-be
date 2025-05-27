import express from "express";
import {
  createNewCategory,
  deleteCategory,
  getCategories,
} from "../controllers/category.controller.js";
const route = express.Router();

route.post("/", createNewCategory);
route.get("/", getCategories);
route.delete("/:id", deleteCategory);

export default route;
