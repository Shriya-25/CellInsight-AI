import express from "express";
import Notification from "../models/Notification.js";

const router = express.Router();

// GET /api/notifications - Get all notifications for the user
router.get("/", async (req, res) => {
  try {
    const query = req.user ? { $or: [{ userId: req.user.id }, { userId: null }] } : {};
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(20);
    return res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ error: "Failed to fetch notifications." });
  }
});

// PATCH /api/notifications/read - Mark all unread as read
router.patch("/read", async (req, res) => {
  try {
    const query = req.user ? { $or: [{ userId: req.user.id }, { userId: null }] } : {};
    await Notification.updateMany({ ...query, isRead: false }, { $set: { isRead: true } });
    return res.json({ success: true });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return res.status(500).json({ error: "Failed to update notifications." });
  }
});

export default router;
