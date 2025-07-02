import express from "express";
import {
  createNewTag,
  deleteTag,
  getAllNameTags,
} from "../controllers/tag.controller.js";
const tagRouter = express.Router();

tagRouter.post("/", createNewTag);
tagRouter.get("/", getAllNameTags);
tagRouter.delete("/:id", deleteTag);

export default tagRouter;
