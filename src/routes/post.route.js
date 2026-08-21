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
import { requireAuth, requireAdmin } from "../middlewares/auth.js";

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
 *         - category
 *       properties:
 *         _id:
 *           type: string
 *           description: ID tự động của bài viết
 *         user:
 *           type: string
 *           description: ID tác giả (User)
 *         img:
 *           type: string
 *           description: Ảnh đại diện bài viết
 *         title:
 *           type: string
 *           description: Tiêu đề bài viết
 *         slug:
 *           type: string
 *           description: Slug duy nhất, tự sinh từ title
 *         desc:
 *           type: string
 *           description: Mô tả ngắn
 *         content:
 *           type: string
 *           description: Nội dung bài viết
 *         category:
 *           type: string
 *           description: ID chuyên mục (Category)
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Danh sách ID tag
 *         isFeature:
 *           type: boolean
 *           description: Bài viết nổi bật (chỉ admin đổi được)
 *         isPublished:
 *           type: boolean
 *           description: Đã publish hay chưa (cron tự bật khi publishedAt <= now)
 *         publishedAt:
 *           type: string
 *           format: date-time
 *           description: Thời điểm lên lịch publish
 *         visit:
 *           type: number
 *           description: Số lượt xem
 *         createdAt:
 *           type: string
 *           format: date-time
 *     PostListResponse:
 *       type: object
 *       properties:
 *         posts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Post'
 *         hasMore:
 *           type: boolean
 *         totalPages:
 *           type: integer
 *         totalPosts:
 *           type: integer
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Lấy danh sách bài viết đã publish (phân trang, filter, search)
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: cat
 *         schema: { type: string }
 *         description: ID chuyên mục để lọc
 *       - in: query
 *         name: author
 *         schema: { type: string }
 *         description: username tác giả để lọc
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Tìm theo tiêu đề (regex, không phân biệt hoa thường)
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [newest, oldest, popular, trending] }
 *       - in: query
 *         name: featured
 *         schema: { type: boolean }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostListResponse'
 *       400:
 *         description: Không tìm thấy tác giả (khi filter theo author)
 */
postRouter.get("/", getPosts);

/**
 * @swagger
 * /posts/upload-auth:
 *   get:
 *     summary: Lấy token xác thực để upload ảnh lên ImageKit
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: Token upload trả về thành công
 */
postRouter.get("/upload-auth", uploadAuth);

/**
 * @swagger
 * /posts/sumPost:
 *   get:
 *     summary: Tổng số bài viết đã publish (public)
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalPosts: { type: integer }
 */
postRouter.get("/sumPost", sumAllPost);

/**
 * @swagger
 * /posts/sumPostUser:
 *   get:
 *     summary: Tổng số bài viết (admin) hoặc tổng lượt xem bài viết của chính mình (user)
 *     tags: [Posts]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Thành công
 *       401:
 *         description: Chưa đăng nhập
 */
postRouter.get("/sumPostUser", requireAuth, sumAllPostByUser);

/**
 * @swagger
 * /posts/sumVisit:
 *   get:
 *     summary: Tổng lượt xem của toàn bộ bài viết đã publish (public)
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalVisits: { type: integer }
 */
postRouter.get("/sumVisit", getSumVisitPost);

/**
 * @swagger
 * /posts/user:
 *   get:
 *     summary: Lấy bài viết đã publish của chính mình (admin xem tất cả)
 *     tags: [Posts]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 5 }
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostListResponse'
 *       401:
 *         description: Chưa đăng nhập
 */
postRouter.get("/user", requireAuth, getPostByUser);

/**
 * @swagger
 * /posts/user/schedule:
 *   get:
 *     summary: Lấy bài viết chưa publish (đang chờ lịch) của chính mình (admin xem tất cả)
 *     tags: [Posts]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 5 }
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostListResponse'
 *       401:
 *         description: Chưa đăng nhập
 */
postRouter.get("/user/schedule", requireAuth, getPostByUserSchedule);

/**
 * @swagger
 * /posts/user/{id}:
 *   get:
 *     summary: Lấy bài viết đã publish của một user theo ID
 *     tags: [Posts]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID của User
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 5 }
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostListResponse'
 *       401:
 *         description: Chưa đăng nhập
 */
postRouter.get("/user/:id", requireAuth, getPostByUserId);

/**
 * @swagger
 * /posts/statistic:
 *   get:
 *     summary: Thống kê tổng quan bài viết (chỉ admin)
 *     tags: [Posts]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Thành công
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 */
postRouter.get("/statistic", requireAuth, requireAdmin, statistic);

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Lấy chi tiết một bài viết theo ID (tự động tăng lượt xem)
 *     tags: [Posts]
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
 *               $ref: '#/components/schemas/Post'
 */
postRouter.get("/:id", increaseVisit, getPost);

/**
 * @swagger
 * /posts/related/{id}:
 *   get:
 *     summary: Lấy bài viết liên quan (cùng chuyên mục/tag/tiêu đề tương tự)
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Thành công
 *       404:
 *         description: Không tìm thấy bài viết
 */
postRouter.get("/related/:id", relatedPosts);

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Tạo bài viết mới
 *     tags: [Posts]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content, category]
 *             properties:
 *               title: { type: string }
 *               content: { type: string }
 *               desc: { type: string }
 *               img: { type: string }
 *               category: { type: string }
 *               tags:
 *                 type: array
 *                 items: { type: string }
 *               publishedAt: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy user
 */
postRouter.post("/", requireAuth, createNewPost);

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Xoá bài viết (chủ bài viết hoặc admin)
 *     tags: [Posts]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Xoá thành công
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không phải chủ bài viết
 */
postRouter.delete("/:id", requireAuth, deletePost);

/**
 * @swagger
 * /posts/feature:
 *   patch:
 *     summary: Bật/tắt bài viết nổi bật (chỉ admin)
 *     tags: [Posts]
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
 *       403:
 *         description: Không có quyền admin
 *       400:
 *         description: Không tìm thấy bài viết
 */
postRouter.patch("/feature", requireAuth, requireAdmin, featurePost);

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Cập nhật bài viết (chủ bài viết hoặc admin)
 *     tags: [Posts]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               content: { type: string }
 *               desc: { type: string }
 *               img: { type: string }
 *               category: { type: string }
 *               tags:
 *                 type: array
 *                 items: { type: string }
 *               publishedAt: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không phải chủ bài viết
 *       404:
 *         description: Không tìm thấy bài viết
 */
postRouter.put("/:id", requireAuth, updatePost);

export default postRouter;
