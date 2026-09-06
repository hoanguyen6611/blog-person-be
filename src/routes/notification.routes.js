import express from "express";
import {
  getNotificationsByUser,
  getNotificationsByUserLimit,
  markAllAsRead,
  markNotificationAsRead,
  subscribePush,
  unsubscribePush,
} from "../controllers/notification.controller.js";
import { requireAuth } from "../middlewares/auth.js";
const notificationRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         recipientId: { type: string }
 *         type:
 *           type: string
 *           enum: [comment, reply, follow, like, post, other]
 *         postId: { type: string }
 *         commentId: { type: string }
 *         isRead: { type: boolean }
 *         message: { type: string }
 *         createdAt: { type: string, format: date-time }
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Lấy 8 thông báo gần nhất của chính mình
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Notification' }
 *       401:
 *         description: Chưa đăng nhập
 */
notificationRouter.get("/", requireAuth, getNotificationsByUserLimit);

/**
 * @swagger
 * /notifications/all:
 *   get:
 *     summary: Lấy toàn bộ thông báo của chính mình (phân trang)
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Notification' }
 *                 hasMore: { type: boolean }
 *                 totalPages: { type: integer }
 *                 totalNotifications: { type: integer }
 *       401:
 *         description: Chưa đăng nhập
 */
notificationRouter.get("/all", requireAuth, getNotificationsByUser);

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Đánh dấu một thông báo là đã đọc
 *     tags: [Notifications]
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
 *             schema: { $ref: '#/components/schemas/Notification' }
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy thông báo
 */
notificationRouter.patch("/:id/read", requireAuth, markNotificationAsRead);

/**
 * @swagger
 * /notifications/readAll:
 *   patch:
 *     summary: Đánh dấu toàn bộ thông báo của chính mình là đã đọc
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Thành công
 *       401:
 *         description: Chưa đăng nhập
 */
notificationRouter.patch("/readAll", requireAuth, markAllAsRead);

/**
 * @swagger
 * /notifications/push-subscribe:
 *   post:
 *     summary: Lưu push subscription (Web Push) của trình duyệt hiện tại theo user đăng nhập
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       description: Gửi nguyên object trả về từ PushSubscription.toJSON() phía FE
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [endpoint, keys]
 *             properties:
 *               endpoint: { type: string }
 *               keys:
 *                 type: object
 *                 required: [p256dh, auth]
 *                 properties:
 *                   p256dh: { type: string }
 *                   auth: { type: string }
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Thiếu endpoint hoặc keys
 *       401:
 *         description: Chưa đăng nhập
 */
notificationRouter.post("/push-subscribe", requireAuth, subscribePush);

/**
 * @swagger
 * /notifications/push-unsubscribe:
 *   post:
 *     summary: Xoá push subscription theo endpoint (khi user tắt thông báo đẩy)
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [endpoint]
 *             properties:
 *               endpoint: { type: string }
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Thiếu endpoint
 *       401:
 *         description: Chưa đăng nhập
 */
notificationRouter.post("/push-unsubscribe", requireAuth, unsubscribePush);

export default notificationRouter;
