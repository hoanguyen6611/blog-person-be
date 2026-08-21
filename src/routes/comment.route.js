import express from "express";
import {
  createNewComment,
  getCommentByPost,
  deleteComment,
  likeCommentV1,
  disLikeCommentV1,
  likeCommentList,
} from "../controllers/comment.controller.js";
import { requireAuth } from "../middlewares/auth.js";
const commentRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required: [post, desc]
 *       properties:
 *         _id: { type: string }
 *         user: { type: string }
 *         post: { type: string }
 *         desc: { type: string }
 *         parentId:
 *           type: string
 *           nullable: true
 *           description: ID comment cha (nếu là reply)
 *         like: { type: integer }
 *         createdAt: { type: string, format: date-time }
 */

/**
 * @swagger
 * /comments/{postId}:
 *   get:
 *     summary: Lấy toàn bộ comment của một bài viết (dạng cây, đã sort theo replies)
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Comment' }
 */
commentRouter.get("/:postId", getCommentByPost);

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Tạo comment mới
 *     tags: [Comments]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [post, desc]
 *             properties:
 *               post: { type: string, description: ID bài viết }
 *               desc: { type: string }
 *               parentId: { type: string, nullable: true }
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy bài viết
 */
commentRouter.post("/", requireAuth, createNewComment);

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Xoá comment (chủ comment hoặc admin)
 *     tags: [Comments]
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
 *         description: Không phải chủ comment
 */
commentRouter.delete("/:id", requireAuth, deleteComment);

/**
 * @swagger
 * /comments/like:
 *   patch:
 *     summary: Like một comment
 *     tags: [Comments]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id: { type: string, description: ID comment }
 *     responses:
 *       200:
 *         description: Like thành công
 *       400:
 *         description: Đã like trước đó
 *       401:
 *         description: Chưa đăng nhập
 */
commentRouter.patch("/like", requireAuth, likeCommentV1);

/**
 * @swagger
 * /comments/disLike:
 *   patch:
 *     summary: Bỏ like một comment
 *     tags: [Comments]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id: { type: string, description: ID comment }
 *     responses:
 *       200:
 *         description: Bỏ like thành công
 *       400:
 *         description: Chưa like comment này
 *       401:
 *         description: Chưa đăng nhập
 */
commentRouter.patch("/disLike", requireAuth, disLikeCommentV1);

/**
 * @swagger
 * /comments/likeCommentList:
 *   patch:
 *     summary: Lấy danh sách ID comment mà mình đã like
 *     tags: [Comments]
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
commentRouter.patch("/likeCommentList", requireAuth, likeCommentList);

export default commentRouter;
