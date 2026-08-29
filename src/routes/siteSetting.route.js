import express from "express";
import {
  getSiteSettings,
  updateSiteSettings,
} from "../controllers/siteSetting.controller.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";

const siteSettingRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     LocalizedText:
 *       type: object
 *       description: Text đa ngôn ngữ, mỗi field dịch có 2 giá trị riêng.
 *       properties:
 *         vi: { type: string }
 *         en: { type: string }
 *     SiteSetting:
 *       type: object
 *       properties:
 *         banner:
 *           type: object
 *           properties:
 *             eyebrow: { $ref: '#/components/schemas/LocalizedText' }
 *             title: { $ref: '#/components/schemas/LocalizedText' }
 *             subtitle: { $ref: '#/components/schemas/LocalizedText' }
 *             primaryButtonText: { $ref: '#/components/schemas/LocalizedText' }
 *             primaryButtonLink: { $ref: '#/components/schemas/LocalizedText' }
 *             secondaryButtonText: { $ref: '#/components/schemas/LocalizedText' }
 *             secondaryButtonLink: { $ref: '#/components/schemas/LocalizedText' }
 *             image: { type: string, description: "URL ảnh banner, dùng chung mọi locale (upload qua /posts/upload-auth)" }
 *         site:
 *           type: object
 *           properties:
 *             name: { $ref: '#/components/schemas/LocalizedText' }
 *             description: { $ref: '#/components/schemas/LocalizedText' }
 *             footerText: { $ref: '#/components/schemas/LocalizedText' }
 *             logo: { type: string, description: "Dùng chung mọi locale" }
 *             favicon: { type: string, description: "Dùng chung mọi locale" }
 *             contactEmail: { type: string, description: "Dùng chung mọi locale" }
 *         social:
 *           type: object
 *           description: Dùng chung mọi locale, không dịch.
 *           properties:
 *             facebook: { type: string }
 *             twitter: { type: string }
 *             instagram: { type: string }
 *             youtube: { type: string }
 *             linkedin: { type: string }
 *             github: { type: string }
 *         seo:
 *           type: object
 *           properties:
 *             metaTitle: { $ref: '#/components/schemas/LocalizedText' }
 *             metaDescription: { $ref: '#/components/schemas/LocalizedText' }
 *             ogImage: { type: string, description: "Dùng chung mọi locale" }
 *         updatedAt: { type: string, format: date-time }
 *     SiteSettingResolved:
 *       type: object
 *       description: Cùng cấu trúc SiteSetting nhưng mỗi field đa ngôn ngữ đã được resolve thành 1 string theo locale yêu cầu.
 */

/**
 * @swagger
 * /settings:
 *   get:
 *     summary: Lấy cấu hình banner + thông tin website (public, FE dùng render trang chủ/footer)
 *     tags: [Settings]
 *     parameters:
 *       - in: query
 *         name: locale
 *         schema: { type: string, enum: [vi, en] }
 *         description: Nếu truyền, mỗi field đa ngôn ngữ trả về 1 string đã resolve theo locale (fallback vi -> en -> rỗng nếu thiếu). Không truyền thì trả về đầy đủ cả vi/en (dùng cho trang quản trị).
 *     responses:
 *       200:
 *         description: Thành công (tự tạo document rỗng nếu chưa từng cấu hình)
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - { $ref: '#/components/schemas/SiteSetting' }
 *                 - { $ref: '#/components/schemas/SiteSettingResolved' }
 */
siteSettingRouter.get("/", getSiteSettings);

/**
 * @swagger
 * /settings:
 *   put:
 *     summary: Cập nhật banner/thông tin website (chỉ admin). Gửi từng phần, từng locale đều được - field/locale không gửi lên sẽ giữ nguyên giá trị cũ.
 *     tags: [Settings]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               banner: { type: object, description: "vd. { title: { vi: '...', en: '...' } }" }
 *               site: { type: object }
 *               social: { type: object }
 *               seo: { type: object }
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SiteSetting' }
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 */
siteSettingRouter.put("/", requireAuth, requireAdmin, updateSiteSettings);

export default siteSettingRouter;
