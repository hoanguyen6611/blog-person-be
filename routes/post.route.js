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
} from "../controllers/post.controller.js";
import increaseVisit from "../middlewares/increaseVisit.js";

const route = express.Router();

route.get("/upload-auth", uploadAuth);
route.get("/", getPosts);
route.get("/user", getPostByUser);
route.get("/:id", increaseVisit, getPost);
route.post("/", createNewPost);
route.delete("/:id", deletePost);
route.patch("/feature", featurePost);
route.put("/:id", updatePost);

export default route;
