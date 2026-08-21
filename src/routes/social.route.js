import express from "express";
import { createNewSocial } from "../controllers/social.controller.js";
import { requireAuth } from "../middlewares/auth.js";
const socialRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Social:
 *       type: object
 *       required: [name, url]
 *       properties:
 *         _id: { type: string }
 *         name: { type: string }
 *         url: { type: string }
 *         isVisible: { type: boolean }
 *         user: { type: string }
 *         createdAt: { type: string, format: date-time }
 */

/**
 * @swagger
 * /social:
 *   post:
 *     summary: Thêm liên kết mạng xã hội cho chính mình
 *     tags: [Social]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, url]
 *             properties:
 *               name: { type: string }
 *               url: { type: string }
 *     responses:
 *       200:
 *         description: Thêm thành công (hoặc đã tồn tại)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Social' }
 *       401:
 *         description: Chưa đăng nhập
 */
socialRouter.post("/", requireAuth, createNewSocial);

export default socialRouter;
