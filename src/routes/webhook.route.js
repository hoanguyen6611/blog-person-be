import express from "express";
import { clerkWebHook } from "../controllers/webhookcontroller.js";
import bodyParser from "body-parser";

const webHookRouter = express.Router();

/**
 * @swagger
 * /webhooks/clerk:
 *   post:
 *     summary: Webhook nhận sự kiện từ Clerk (svix signature verification, dùng raw body)
 *     description: Không gọi trực tiếp từ Swagger UI - endpoint này yêu cầu header chữ ký svix hợp lệ do Clerk gửi.
 *     tags: [Webhooks]
 *     responses:
 *       200:
 *         description: Webhook đã nhận và xử lý
 *       400:
 *         description: Verify chữ ký thất bại
 */
webHookRouter.post(
  "/clerk",
  bodyParser.raw({ type: "application/json" }),
  clerkWebHook
);

export default webHookRouter;
