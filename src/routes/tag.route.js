import express from "express";
import {
  createNewTag,
  deleteTag,
  getAllNameTags,
} from "../controllers/tag.controller.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";
const tagRouter = express.Router();

tagRouter.post("/", requireAuth, createNewTag);
tagRouter.get("/", getAllNameTags);
tagRouter.delete("/:id", requireAuth, requireAdmin, deleteTag);

export default tagRouter;
