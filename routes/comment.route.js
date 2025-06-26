import express from "express";
import {
  createNewComment,
  getCommentByPost,
  getComment,
  deleteComment,
  disLikeComment,
  likeComment,
} from "../controllers/comment.controller.js";
const router = express.Router();

router.get("/:postId", getCommentByPost);
router.get("/:postId", getComment);
router.post("/", createNewComment);
router.delete("/:id", deleteComment);
router.patch("/like", likeComment);
router.patch("/disLike", disLikeComment);

export default router;
