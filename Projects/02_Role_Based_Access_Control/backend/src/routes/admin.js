import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireRole, requirePermission } from "../middleware/rolePermission.js";
import User from "../models/User.js";
const router = express.Router();

// Only admin
router.get("/admin-only", authenticate, requireRole("Admin"), (req, res) => {
  res.json({ message: "Hello Admin" });
});

// Admin or Manager
router.get("/manage", authenticate, requireRole("Admin", "Manager"), (req, res) => {
  res.json({ message: "Admin or Manager" });
});

// Permission based
router.delete("/user/:id", authenticate, requirePermission("delete:user"), async (req, res) => {
  const userId = req.params.id;
  // soft delete
  await User.findByIdAndUpdate(userId, { isDeleted: true });
  res.json({ message: "User soft deleted" });
});

export default router;
