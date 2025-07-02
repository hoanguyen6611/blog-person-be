import express from "express";
import {
  getNotificationsByUser,
  markAllAsRead,
  markNotificationAsRead,
} from "../controllers/notification.controller.js";
const notificationRouter = express.Router();

notificationRouter.get("/", getNotificationsByUser);
notificationRouter.patch("/:id/read", markNotificationAsRead);
notificationRouter.patch("/readAll", markAllAsRead);

export default notificationRouter;
