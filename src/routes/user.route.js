import express from "express";
import {
  countNumberFollow,
  followerAuthor,
  getFollowers,
  getFollowersAndFollowing,
  getFollowing,
  getUserByID,
  getUserFollow,
  getUserFollowList,
  getUserLikeComments,
  getUserOtherFollow,
  getUserSavedPosts,
  getUserSavedPostsInfor,
  savedPost,
  sumAllUser,
  updateStatus,
} from "../controllers/user.controller.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";
const userRouter = express.Router();

userRouter.get("/saved", requireAuth, getUserSavedPosts);
userRouter.get("/likeComment", requireAuth, getUserLikeComments);
userRouter.get("/savedInf", requireAuth, getUserSavedPostsInfor);
userRouter.patch("/save", requireAuth, savedPost);
userRouter.patch("/updateStatus", requireAuth, updateStatus);
userRouter.patch("/follow", requireAuth, followerAuthor);
userRouter.get("/follow", requireAuth, getUserFollow);
userRouter.get("/followList", requireAuth, getUserFollowList);
userRouter.get("/getNumberFollow/:id", countNumberFollow);
userRouter.get("/follow/:id", getFollowersAndFollowing);
userRouter.get("/sumUser", requireAuth, requireAdmin, sumAllUser);
userRouter.get("/followers", requireAuth, getFollowers);
userRouter.get("/following", requireAuth, getFollowing);
userRouter.get("/:id", requireAuth, getUserByID);

export default userRouter;
