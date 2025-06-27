import express from "express";
import {
  createNewTag,
  deleteTag,
  getAllNameTags,
} from "../controllers/tag.controller.js";
const router = express.Router();

router.post("/", createNewTag);
router.get("/", getAllNameTags);
router.delete("/:id", deleteTag);

export default router;
