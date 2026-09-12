import express from "express";
import { subscribeNewsletter } from "../controllers/newsletter.controller.js";

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

export default newsletterRouter;
