import express from "express";
import {
  getNotificationsByUser,
  getNotificationsByUserLimit,
  markAllAsRead,
  markNotificationAsRead,
} from "../controllers/notification.controller.js";
const notificationRouter = express.Router();

notificationRouter.get("/", getNotificationsByUserLimit);
notificationRouter.get("/all", getNotificationsByUser);
notificationRouter.patch("/:id/read", markNotificationAsRead);
notificationRouter.patch("/readAll", markAllAsRead);

export default notificationRouter;
