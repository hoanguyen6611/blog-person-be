import express from "express";
import {
  createNewCategory,
  getCategories,
} from "../controllers/category.controller.js";
const route = express.Router();

route.post("/", createNewCategory);
route.get("/", getCategories);

export default route;
