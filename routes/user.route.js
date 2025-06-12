import express from "express";
import {
  getUserSavedPosts,
  savedPost,
  sumAllUser,
} from "../controllers/user.controller.js";
const router = express.Router();

router.get("/saved", getUserSavedPosts);
router.patch("/save", savedPost);
router.get("/sumUser", sumAllUser);

export default router;
