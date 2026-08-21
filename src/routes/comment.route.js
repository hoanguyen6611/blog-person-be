import express from "express";
import {
  createNewComment,
  getCommentByPost,
  deleteComment,
  likeCommentV1,
  disLikeCommentV1,
  likeCommentList,
} from "../controllers/comment.controller.js";
import { requireAuth } from "../middlewares/auth.js";
const commentRouter = express.Router();

commentRouter.get("/:postId", getCommentByPost);
commentRouter.post("/", requireAuth, createNewComment);
commentRouter.delete("/:id", requireAuth, deleteComment);
commentRouter.patch("/like", requireAuth, likeCommentV1);
commentRouter.patch("/disLike", requireAuth, disLikeCommentV1);
commentRouter.patch("/likeCommentList", requireAuth, likeCommentList);

export default commentRouter;
