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
  Statistic,
  relatedPosts,
} from "../controllers/post.controller.js";
import increaseVisit from "../middlewares/increaseVisit.js";

const router = express.Router();

router.get("/upload-auth", uploadAuth);
router.get("/", getPosts);
router.get("/sumPost", sumAllPost);
router.get("/sumPostUser", sumAllPostByUser);
router.get("/sumVisit", getSumVisitPost);
router.get("/user", getPostByUser);
router.get("/user/:id", getPostByUserId);
router.get("/statistic", Statistic);
router.get("/:id", increaseVisit, getPost);
router.get("/related/:id", relatedPosts);
router.post("/", createNewPost);
router.delete("/:id", deletePost);
router.patch("/feature", featurePost);
router.put("/:id", updatePost);

export default router;
