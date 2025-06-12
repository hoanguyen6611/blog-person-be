import express from "express";
import {
  createNewComment,
  getCommentByPost,
  getComment,
  deleteComment,
} from "../controllers/comment.controller.js";
const router = express.Router();

router.get("/:postId", getCommentByPost);
router.get("/:postId", getComment);
router.post("/", createNewComment);
router.delete("/:id", deleteComment);

export default router;
