import express from "express";
import {
  createNewTag,
  deleteTag,
  getAllNameTags,
} from "../controllers/tag.controller.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";
const tagRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Tag:
 *       type: object
 *       required: [name, slug]
 *       properties:
 *         _id: { type: string }
 *         name: { type: string }
 *         slug: { type: string }
 *         createdAt: { type: string, format: date-time }
 */

/**
 * @swagger
 * /tags:
 *   post:
 *     summary: Tạo tag mới
 *     tags: [Tags]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *     responses:
 *       201:
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Tag' }
 *       401:
 *         description: Chưa đăng nhập
 */
tagRouter.post("/", requireAuth, createNewTag);

/**
 * @swagger
 * /tags:
 *   get:
 *     summary: Lấy toàn bộ tag
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tags:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Tag' }
 *                 totalTags: { type: integer }
 */
tagRouter.get("/", getAllNameTags);

/**
 * @swagger
 * /tags/{id}:
 *   delete:
 *     summary: Xoá tag (chỉ admin)
 *     tags: [Tags]
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
 *         description: Không có quyền admin
 */
tagRouter.delete("/:id", requireAuth, requireAdmin, deleteTag);

export default tagRouter;
