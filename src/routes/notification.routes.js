import express from "express";
import {
  getNotificationsByUser,
  getNotificationsByUserLimit,
  markAllAsRead,
  markNotificationAsRead,
} from "../controllers/notification.controller.js";
import { requireAuth } from "../middlewares/auth.js";
const notificationRouter = express.Router();

notificationRouter.get("/", requireAuth, getNotificationsByUserLimit);
notificationRouter.get("/all", requireAuth, getNotificationsByUser);
notificationRouter.patch("/:id/read", requireAuth, markNotificationAsRead);
notificationRouter.patch("/readAll", requireAuth, markAllAsRead);

export default notificationRouter;
