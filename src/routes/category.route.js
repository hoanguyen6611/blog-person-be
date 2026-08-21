import express from "express";
import {
  changeStatus,
  createNewCategory,
  deleteCategory,
  getAllCategories,
  getCategories,
  getCategoriesBy,
} from "../controllers/category.controller.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";
const categoryRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required: [title]
 *       properties:
 *         _id: { type: string }
 *         title: { type: string }
 *         status:
 *           type: boolean
 *           description: Hiển thị hay không (mặc định true)
 *         createdAt: { type: string, format: date-time }
 *     CategoryListResponse:
 *       type: object
 *       properties:
 *         categories:
 *           type: array
 *           items: { $ref: '#/components/schemas/Category' }
 *         hasMore: { type: boolean }
 *         totalPages: { type: integer }
 *         totalCategories: { type: integer }
 */

/**
 * @swagger
 * /category:
 *   post:
 *     summary: Tạo chuyên mục mới
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string }
 *     responses:
 *       201:
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Category' }
 *       401:
 *         description: Chưa đăng nhập
 */
categoryRouter.post("/", requireAuth, createNewCategory);

/**
 * @swagger
 * /category:
 *   get:
 *     summary: Lấy danh sách chuyên mục đang hiển thị (status = true)
 *     tags: [Categories]
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
 *             schema: { $ref: '#/components/schemas/CategoryListResponse' }
 */
categoryRouter.get("/", getCategories);

/**
 * @swagger
 * /category/all:
 *   get:
 *     summary: Lấy toàn bộ chuyên mục (bao gồm cả đang ẩn)
 *     tags: [Categories]
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
 *             schema: { $ref: '#/components/schemas/CategoryListResponse' }
 */
categoryRouter.get("/all", getAllCategories);

/**
 * @swagger
 * /category/getLimit:
 *   get:
 *     summary: Lấy chuyên mục có giới hạn số lượng, sắp xếp theo ngày tạo mới nhất
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CategoryListResponse' }
 */
categoryRouter.get("/getLimit", getCategoriesBy);

/**
 * @swagger
 * /category/{id}:
 *   delete:
 *     summary: Xoá chuyên mục (chỉ admin)
 *     tags: [Categories]
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
categoryRouter.delete("/:id", requireAuth, requireAdmin, deleteCategory);

/**
 * @swagger
 * /category/changeStatus/{id}:
 *   patch:
 *     summary: Bật/tắt trạng thái hiển thị chuyên mục (chỉ admin)
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Không dùng trong controller hiện tại, xem categoryId trong body
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoryId]
 *             properties:
 *               categoryId: { type: string }
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Category' }
 *       400:
 *         description: Không tìm thấy chuyên mục
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 */
categoryRouter.patch(
  "/changeStatus/:id",
  requireAuth,
  requireAdmin,
  changeStatus
);

export default categoryRouter;
