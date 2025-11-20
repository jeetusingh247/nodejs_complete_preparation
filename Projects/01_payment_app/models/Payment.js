import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  orderId: String,
  paymentId: String,
  signature: String,
  amount: Number,
  currency: String,
  receiptUrl: String, // PDF file path
  status: { type: String, default: "pending" },
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);
