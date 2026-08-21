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

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         clerkUserId: { type: string }
 *         username: { type: string }
 *         fullname: { type: string }
 *         email: { type: string }
 *         img: { type: string }
 *         status: { type: string }
 *         savedPosts:
 *           type: array
 *           items: { type: string }
 *         likeComments:
 *           type: array
 *           items: { type: string }
 *         follower:
 *           type: array
 *           items: { type: string }
 *         createdAt: { type: string, format: date-time }
 */

/**
 * @swagger
 * /users/saved:
 *   get:
 *     summary: Lấy danh sách ID bài viết đã lưu của chính mình
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { type: string }
 *       401:
 *         description: Chưa đăng nhập
 */
userRouter.get("/saved", requireAuth, getUserSavedPosts);

/**
 * @swagger
 * /users/likeComment:
 *   get:
 *     summary: Lấy danh sách ID comment mình đã like
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { type: string }
 *       401:
 *         description: Chưa đăng nhập
 */
userRouter.get("/likeComment", requireAuth, getUserLikeComments);

/**
 * @swagger
 * /users/savedInf:
 *   get:
 *     summary: Lấy thông tin đầy đủ (phân trang) của các bài viết đã lưu
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Thành công
 *       401:
 *         description: Chưa đăng nhập
 */
userRouter.get("/savedInf", requireAuth, getUserSavedPostsInfor);

/**
 * @swagger
 * /users/save:
 *   patch:
 *     summary: Lưu/bỏ lưu một bài viết (toggle)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [postId]
 *             properties:
 *               postId: { type: string }
 *     responses:
 *       200:
 *         description: Thành công
 *       401:
 *         description: Chưa đăng nhập
 */
userRouter.patch("/save", requireAuth, savedPost);

/**
 * @swagger
 * /users/updateStatus:
 *   patch:
 *     summary: Cập nhật trạng thái (status) cá nhân
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string }
 *     responses:
 *       200:
 *         description: Thành công
 *       401:
 *         description: Chưa đăng nhập
 */
userRouter.patch("/updateStatus", requireAuth, updateStatus);

/**
 * @swagger
 * /users/follow:
 *   patch:
 *     summary: Follow/unfollow một user (toggle)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId: { type: string }
 *     responses:
 *       200:
 *         description: Thành công
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy user cần follow
 */
userRouter.patch("/follow", requireAuth, followerAuthor);

/**
 * @swagger
 * /users/follow:
 *   get:
 *     summary: Lấy danh sách follower/following của chính mình
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 followers:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/User' }
 *                 following:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Chưa đăng nhập
 */
userRouter.get("/follow", requireAuth, getUserFollow);

/**
 * @swagger
 * /users/followList:
 *   get:
 *     summary: Lấy danh sách ID người mình đang follow
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { type: string }
 *       401:
 *         description: Chưa đăng nhập
 */
userRouter.get("/followList", requireAuth, getUserFollowList);

/**
 * @swagger
 * /users/getNumberFollow/{id}:
 *   get:
 *     summary: Đếm số lượng follower của một user (public)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 followerCounts: { type: integer }
 */
userRouter.get("/getNumberFollow/:id", countNumberFollow);

/**
 * @swagger
 * /users/follow/{id}:
 *   get:
 *     summary: Lấy follower/following của một user theo ID (public)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: ID không hợp lệ
 *       404:
 *         description: Không tìm thấy user
 */
userRouter.get("/follow/:id", getFollowersAndFollowing);

/**
 * @swagger
 * /users/sumUser:
 *   get:
 *     summary: Lấy danh sách toàn bộ user (chỉ admin)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Thành công
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 */
userRouter.get("/sumUser", requireAuth, requireAdmin, sumAllUser);

/**
 * @swagger
 * /users/followers:
 *   get:
 *     summary: Lấy danh sách user đang follow chính mình
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Thành công
 *       401:
 *         description: Chưa đăng nhập
 */
userRouter.get("/followers", requireAuth, getFollowers);

/**
 * @swagger
 * /users/following:
 *   get:
 *     summary: Lấy danh sách user mà chính mình đang follow
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Thành công
 *       401:
 *         description: Chưa đăng nhập
 */
userRouter.get("/following", requireAuth, getFollowing);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Lấy thông tin một user theo ID
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Chưa đăng nhập
 */
userRouter.get("/:id", requireAuth, getUserByID);

export default userRouter;
