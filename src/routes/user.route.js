import express from "express";
import {
  countNumberFollow,
  followerAuthor,
  getFollowers,
  getFollowing,
  getUserByID,
  getUserFollow,
  getUserLikeComments,
  getUserSavedPosts,
  getUserSavedPostsInfor,
  savedPost,
  sumAllUser,
  updateStatus,
} from "../controllers/user.controller.js";
const router = express.Router();

router.get("/saved", getUserSavedPosts);
router.get("/likeComment", getUserLikeComments);
router.get("/savedInf", getUserSavedPostsInfor);
router.patch("/save", savedPost);
router.patch("/updateStatus", updateStatus);
router.patch("/follow", followerAuthor);
router.get("/follow", getUserFollow);
router.get("/getNumberFollow/:id", countNumberFollow);
router.get("/sumUser", sumAllUser);
router.get("/:id", getUserByID);
router.get("/followers", getFollowers);
router.get("/following", getFollowing);

export default router;
