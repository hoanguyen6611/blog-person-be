import express from "express";
import {
  getUserSavedPosts,
  getUserSavedPostsInfor,
  savedPost,
  sumAllUser,
} from "../controllers/user.controller.js";
const router = express.Router();

router.get("/saved", getUserSavedPosts);
router.get("/savedInf", getUserSavedPostsInfor);
router.patch("/save", savedPost);
router.get("/sumUser", sumAllUser);

export default router;
