import express from "express";
import {
  getUserByID,
  getUserLikeComments,
  getUserSavedPosts,
  getUserSavedPostsInfor,
  savedPost,
  sumAllUser,
} from "../controllers/user.controller.js";
const router = express.Router();

router.get("/saved", getUserSavedPosts);
router.get("/likeComment", getUserLikeComments);
router.get("/savedInf", getUserSavedPostsInfor);
router.patch("/save", savedPost);
router.get("/sumUser", sumAllUser);
router.get("/:id", getUserByID);

export default router;
