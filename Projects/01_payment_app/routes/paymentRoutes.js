import express from "express";
import {
  createOrder,
  verifyPayment,
  downloadReceipt
} from "../controllers/paymentController.js";

const router = express.Router();

// Create Razorpay Order
router.post("/order", createOrder);

// Verify Razorpay Payment
router.post("/verify", verifyPayment);

// Download PDF Receipt
router.get("/receipt/:paymentId", downloadReceipt);

export default router;
