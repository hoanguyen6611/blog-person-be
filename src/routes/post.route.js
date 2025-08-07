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

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         _id:
 *           type: string
 *           description: ID tự động của bài viết
 *         title:
 *           type: string
 *           description: Tiêu đề bài viết
 *         content:
 *           type: string
 *           description: Nội dung bài viết
 *         author:
 *           type: string
 *           description: Tác giả
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Ngày tạo
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Lấy danh sách bài viết
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 */
postRouter.get("/", getPosts);
/**
 * @swagger
 * /posts/upload-auth:
 *   get:
 *     summary: Lấy token xác thực upload ảnh
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: Token upload trả về thành công
 */
postRouter.get("/upload-auth", uploadAuth);
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
