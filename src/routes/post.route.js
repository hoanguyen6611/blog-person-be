import express from "express";
import {
  getPosts,
  getPost,
  createNewPost,
  deletePost,
  uploadAuth,
  featurePost,
  updatePost,
  getPostByUser,
  sumAllPost,
  getSumVisitPost,
  sumAllPostByUser,
  getPostByUserId,
  statistic,
  relatedPosts,
  getPostByUserSchedule,
} from "../controllers/post.controller.js";
import increaseVisit from "../middlewares/increaseVisit.js";

const postRouter = express.Router();

postRouter.get("/upload-auth", uploadAuth);
postRouter.get("/", getPosts);
postRouter.get("/sumPost", sumAllPost);
postRouter.get("/sumPostUser", sumAllPostByUser);
postRouter.get("/sumVisit", getSumVisitPost);
postRouter.get("/user", getPostByUser);
postRouter.get("/user/schedule", getPostByUserSchedule);
postRouter.get("/user/:id", getPostByUserId);
postRouter.get("/statistic", statistic);
postRouter.get("/:id", increaseVisit, getPost);
postRouter.get("/related/:id", relatedPosts);
postRouter.post("/", createNewPost);
postRouter.delete("/:id", deletePost);
postRouter.patch("/feature", featurePost);
postRouter.put("/:id", updatePost);

export default postRouter;
