import express from "express";
import postRouter from "./post.route.js";
import userRouter from "./user.route.js";
import commentRouter from "./comment.route.js";
import tagRouter from "./tag.route.js";
import categoryRouter from "./category.route.js";
import notificationRouter from "./notification.routes.js";
import webHookRouter from "./webhook.route.js";
import socialRouter from "./social.route.js";
const router = express.Router();

router.use("/webhooks", webHookRouter);
router.use("/posts", postRouter);
router.use("/users", userRouter);
router.use("/comments", commentRouter);
router.use("/tags", tagRouter);
router.use("/category", categoryRouter);
router.use("/notifications", notificationRouter);
router.use("/social", socialRouter);

export default router;
