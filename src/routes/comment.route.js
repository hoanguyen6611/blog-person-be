import express from "express";
import {
  createNewComment,
  getCommentByPost,
  getComment,
  deleteComment,
  disLikeComment,
  likeComment,
  likeCommentV1,
  disLikeCommentV1,
  likeCommentList,
} from "../controllers/comment.controller.js";
const commentRouter = express.Router();

commentRouter.get("/:postId", getCommentByPost);
commentRouter.get("/:postId", getComment);
commentRouter.post("/", createNewComment);
commentRouter.delete("/:id", deleteComment);
commentRouter.patch("/like", likeCommentV1);
commentRouter.patch("/disLike", disLikeCommentV1);
commentRouter.patch("/likeCommentList", likeCommentList);
// router.patch("/disLike", disLikeComment);

export default commentRouter;
