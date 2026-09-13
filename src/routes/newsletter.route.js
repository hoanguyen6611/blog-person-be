import express from "express";
import {
  subscribeNewsletter,
  getSubscribers,
  toggleSubscriberStatus,
  deleteSubscriber,
  previewDigest,
  sendDigestNow,
  unsubscribe,
} from "../controllers/newsletter.controller.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";

const newsletterRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Subscriber:
 *       type: object
 *       required: [email]
 *       properties:
 *         _id: { type: string }
 *         email: { type: string }
 *         isActive: { type: boolean }
 *         createdAt: { type: string, format: date-time }
 */

/**
 * @swagger
 * /newsletter/subscribe:
 *   post:
 *     summary: Đăng ký nhận bản tin (public, dùng cho form ở Footer/banner)
 *     tags: [Newsletter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string }
 *     responses:
 *       201:
 *         description: Đăng ký thành công (email mới)
 *       200:
 *         description: Đăng ký thành công (email đã tồn tại, hoặc được kích hoạt lại)
 *       400:
 *         description: Email không hợp lệ
 */
newsletterRouter.post("/subscribe", subscribeNewsletter);

/**
 * @swagger
 * /newsletter/subscribers:
 *   get:
 *     summary: Danh sách người đăng ký bản tin (admin)
 *     tags: [Newsletter]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Lọc theo email (không phân biệt hoa/thường)
 *     responses:
 *       200:
 *         description: Danh sách người đăng ký kèm số liệu tổng/đang hoạt động
 */
newsletterRouter.get(
  "/subscribers",
  requireAuth,
  requireAdmin,
  getSubscribers
);

/**
 * @swagger
 * /newsletter/subscribers/{id}/status:
 *   patch:
 *     summary: Bật/tắt trạng thái hoạt động của người đăng ký (admin)
 *     tags: [Newsletter]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Subscriber đã cập nhật
 *       404:
 *         description: Không tìm thấy
 */
newsletterRouter.patch(
  "/subscribers/:id/status",
  requireAuth,
  requireAdmin,
  toggleSubscriberStatus
);

/**
 * @swagger
 * /newsletter/subscribers/{id}:
 *   delete:
 *     summary: Xoá người đăng ký (admin)
 *     tags: [Newsletter]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Đã xoá
 *       404:
 *         description: Không tìm thấy
 */
newsletterRouter.delete(
  "/subscribers/:id",
  requireAuth,
  requireAdmin,
  deleteSubscriber
);

/**
 * @swagger
 * /newsletter/preview:
 *   get:
 *     summary: Xem trước 3 bài sẽ được gửi trong bản tin kế tiếp (admin)
 *     tags: [Newsletter]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Danh sách bài viết + số người đăng ký đang hoạt động
 */
newsletterRouter.get("/preview", requireAuth, requireAdmin, previewDigest);

/**
 * @swagger
 * /newsletter/send:
 *   post:
 *     summary: Gửi bản tin ngay lập tức tới toàn bộ người đăng ký đang hoạt động (admin)
 *     tags: [Newsletter]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Đã gửi — kèm số lượng thành công/thất bại
 *       400:
 *         description: Bỏ qua (chưa cấu hình RESEND_API_KEY, hoặc không có bài viết nào trong 7 ngày qua)
 */
newsletterRouter.post("/send", requireAuth, requireAdmin, sendDigestNow);

/**
 * @swagger
 * /newsletter/unsubscribe/{id}:
 *   get:
 *     summary: Huỷ đăng ký bản tin qua link trong email (public)
 *     tags: [Newsletter]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Đã huỷ đăng ký
 *       404:
 *         description: Không tìm thấy
 */
newsletterRouter.get("/unsubscribe/:id", unsubscribe);

export default newsletterRouter;
