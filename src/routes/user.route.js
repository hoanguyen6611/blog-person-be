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
const userRouter = express.Router();

userRouter.get("/saved", getUserSavedPosts);
userRouter.get("/likeComment", getUserLikeComments);
userRouter.get("/savedInf", getUserSavedPostsInfor);
userRouter.patch("/save", savedPost);
userRouter.patch("/updateStatus", updateStatus);
userRouter.patch("/follow", followerAuthor);
userRouter.get("/follow", getUserFollow);
userRouter.get("/followList", getUserFollowList);
userRouter.get("/getNumberFollow/:id", countNumberFollow);
userRouter.get("/follow/:id", getFollowersAndFollowing);
userRouter.get("/sumUser", sumAllUser);
userRouter.get("/:id", getUserByID);
userRouter.get("/followers", getFollowers);
userRouter.get("/following", getFollowing);

export default userRouter;
