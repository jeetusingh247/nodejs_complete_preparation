import Razorpay from "razorpay";
import crypto from "crypto";
import fs from "fs";
import PDFDocument from "pdfkit";
import Payment from "../models/Payment.js";


// ------------------------------
//  CREATE ORDER
// ------------------------------
export const createOrder = async (req, res) => {
  try {
    const { amount, email } = req.body; // Email added

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now()
    };

    const order = await instance.orders.create(options);

    // Save initial order info
    await Payment.create({
      orderId: order.id,
      amount: amount * 100,
      currency: "INR",
      email,
      status: "created"
    });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ------------------------------
//  GENERATE RECEIPT PDF
// ------------------------------
const generateReceiptPDF = (payment) => {
  const folder = "./receipts";
  if (!fs.existsSync(folder)) fs.mkdirSync(folder);

  const pdfPath = `${folder}/receipt_${payment.paymentId}.pdf`;

  const doc = new PDFDocument();
  const writeStream = fs.createWriteStream(pdfPath);

  doc.pipe(writeStream);

  doc.fontSize(22).text("Payment Receipt", { align: "center" });
  doc.moveDown();

  doc.fontSize(14).text(`Order ID: ${payment.orderId}`);
  doc.text(`Payment ID: ${payment.paymentId}`);
  doc.text(`Email: ${payment.email}`);
  doc.text(`Amount Paid: ₹${payment.amount / 100}`);
  doc.text(`Status: ${payment.status}`);
  doc.text(`Date: ${new Date().toLocaleString()}`);

  doc.end();

  return pdfPath;
};


// ------------------------------
//  VERIFY PAYMENT
// ------------------------------
export const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    const body = orderId + "|" + paymentId;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature"
      });
    }

    // Update payment status
    const payment = await Payment.findOneAndUpdate(
      { orderId },
      { paymentId, signature, status: "success" },
      { new: true }
    );

    // Generate PDF receipt
    const receiptPath = generateReceiptPDF(payment);

    payment.receiptUrl = receiptPath;
    await payment.save();

    res.json({
      success: true,
      message: "Payment verified!",
      receiptUrl: receiptPath
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ------------------------------
//  DOWNLOAD RECEIPT
// ------------------------------
export const downloadReceipt = (req, res) => {
  const { paymentId } = req.params;

  const filePath = `./receipts/receipt_${paymentId}.pdf`;

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Receipt not found" });
  }

  res.download(filePath);
};
