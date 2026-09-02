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
  getUserDraftPosts,
  setPostPublishStatus,
  schedulePost,
  bulkChangeCategory,
  bulkAddTags,
  bulkSetPublishStatus,
  bulkDeletePosts,
  getTrafficStats,
} from "../controllers/post.controller.js";
import increaseVisit from "../middlewares/increaseVisit.js";
import identifyVisitor from "../middlewares/visitorId.js";
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
 *           description: Đã publish hay chưa
 *         publishedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: null = bài nháp. Có giá trị = đã lên lịch, cron tự publish khi tới giờ.
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
 *         schema: { type: integer, default: 12 }
 *       - in: query
 *         name: cat
 *         schema: { type: string }
 *         description: ID chuyên mục để lọc
 *       - in: query
 *         name: tag
 *         schema: { type: string }
 *         description: ID tag để lọc (bài viết chứa tag này trong mảng tags)
 *       - in: query
 *         name: tags
 *         schema: { type: string }
 *         description: Danh sách ID tag cách nhau bởi dấu phẩy (vd. id1,id2) - lọc bài chứa BẤT KỲ tag nào trong danh sách (OR). Ưu tiên hơn "tag" nếu cả 2 cùng được truyền.
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
 *     summary: Lấy bài viết đã lên lịch đăng (có publishedAt, chưa publish) của chính mình (admin xem tất cả)
 *     tags: [Posts]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 5 }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date-time }
 *         description: Lọc theo publishedAt >= from (vd. đầu tuần)
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date-time }
 *         description: Lọc theo publishedAt <= to (vd. cuối tuần)
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
 * /posts/user/draft:
 *   get:
 *     summary: Lấy bài nháp (chưa publish, chưa hẹn giờ) của chính mình (admin xem tất cả)
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
postRouter.get("/user/draft", requireAuth, getUserDraftPosts);

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
 * /posts/stats/traffic:
 *   get:
 *     summary: Thống kê lượt xem theo ngày, %trend so với kỳ trước, unique/returning visitor (chỉ admin)
 *     tags: [Posts]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema: { type: integer, default: 30 }
 *         description: Số ngày của kỳ thống kê (so sánh với kỳ liền trước cùng độ dài)
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 period:
 *                   type: object
 *                   properties:
 *                     days: { type: integer }
 *                     from: { type: string, format: date-time }
 *                     to: { type: string, format: date-time }
 *                 totalViews: { type: integer }
 *                 previousPeriodViews: { type: integer }
 *                 trendPercent: { type: number }
 *                 uniqueVisitors: { type: integer }
 *                 returningVisitors: { type: integer }
 *                 returningRatePercent: { type: number }
 *                 dailyViews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date: { type: string }
 *                       count: { type: integer }
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 */
postRouter.get("/stats/traffic", requireAuth, requireAdmin, getTrafficStats);

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
 *     summary: Lấy chi tiết một bài viết theo ID (tự động tăng lượt xem + log lượt xem theo visitor)
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
postRouter.get("/:id", identifyVisitor, increaseVisit, getPost);

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
 *     summary: Tạo bài viết mới (đăng ngay hoặc lưu nháp/lên lịch)
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
 *               publishedAt:
 *                 type: string
 *                 format: date-time
 *                 description: Bỏ trống = lưu nháp. Có giá trị tương lai = lên lịch (cron tự publish).
 *               isPublished:
 *                 type: boolean
 *                 description: true = đăng ngay lập tức (tự set publishedAt = hiện tại nếu chưa có)
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
 * /posts/bulk:
 *   delete:
 *     summary: Xoá nhiều bài viết cùng lúc (chỉ admin)
 *     tags: [Posts]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [postIds]
 *             properties:
 *               postIds:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deleted: { type: integer }
 *       400:
 *         description: Thiếu postIds
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 */
postRouter.delete("/bulk", requireAuth, requireAdmin, bulkDeletePosts);

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
 * /posts/bulk/category:
 *   patch:
 *     summary: Đổi chuyên mục cho nhiều bài viết cùng lúc (chỉ admin)
 *     tags: [Posts]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [postIds, category]
 *             properties:
 *               postIds:
 *                 type: array
 *                 items: { type: string }
 *               category: { type: string }
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 matched: { type: integer }
 *                 modified: { type: integer }
 *       400:
 *         description: Thiếu postIds hoặc category
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 */
postRouter.patch(
  "/bulk/category",
  requireAuth,
  requireAdmin,
  bulkChangeCategory
);

/**
 * @swagger
 * /posts/bulk/tags:
 *   patch:
 *     summary: Thêm tag cho nhiều bài viết cùng lúc (cộng dồn, không thay thế) (chỉ admin)
 *     tags: [Posts]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [postIds, tags]
 *             properties:
 *               postIds:
 *                 type: array
 *                 items: { type: string }
 *               tags:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 matched: { type: integer }
 *                 modified: { type: integer }
 *       400:
 *         description: Thiếu postIds hoặc tags
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 */
postRouter.patch("/bulk/tags", requireAuth, requireAdmin, bulkAddTags);

/**
 * @swagger
 * /posts/bulk/publish:
 *   patch:
 *     summary: Xuất bản/gỡ xuất bản nhiều bài viết cùng lúc (chỉ admin)
 *     tags: [Posts]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [postIds, isPublished]
 *             properties:
 *               postIds:
 *                 type: array
 *                 items: { type: string }
 *               isPublished: { type: boolean }
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 matched: { type: integer }
 *                 modified: { type: integer }
 *       400:
 *         description: Thiếu postIds
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 */
postRouter.patch(
  "/bulk/publish",
  requireAuth,
  requireAdmin,
  bulkSetPublishStatus
);

/**
 * @swagger
 * /posts/{id}/publish-status:
 *   patch:
 *     summary: Chuyển bài viết giữa Nháp <-> Đã xuất bản (chủ bài viết hoặc admin)
 *     tags: [Posts]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isPublished]
 *             properties:
 *               isPublished: { type: boolean }
 *     responses:
 *       200:
 *         description: Thành công
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
postRouter.patch(
  "/:id/publish-status",
  requireAuth,
  setPostPublishStatus
);

/**
 * @swagger
 * /posts/{id}/schedule:
 *   patch:
 *     summary: Đổi giờ đăng của bài viết (chủ bài viết hoặc admin)
 *     tags: [Posts]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [publishedAt]
 *             properties:
 *               publishedAt: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Thiếu publishedAt
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không phải chủ bài viết
 *       404:
 *         description: Không tìm thấy bài viết
 */
postRouter.patch("/:id/schedule", requireAuth, schedulePost);

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
