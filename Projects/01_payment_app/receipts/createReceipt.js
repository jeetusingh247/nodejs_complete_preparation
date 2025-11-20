import fs from "fs";
import PDFDocument from "pdfkit";

export const generateReceiptPDF = (payment) => {
  const pdfPath = `./receipts/receipt_${payment.paymentId}.pdf`;

  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(pdfPath));

  doc.fontSize(20).text("Payment Receipt", { align: "center" });

  doc.moveDown();
  doc.fontSize(14).text(`Payment ID: ${payment.paymentId}`);
  doc.text(`Order ID: ${payment.orderId}`);
  doc.text(`Amount Paid: ₹${payment.amount / 100}`);
  doc.text(`Status: ${payment.status}`);
  doc.text(`Email: ${payment.email}`);
  doc.text(`Date: ${new Date().toLocaleString()}`);

  doc.end();

  return pdfPath;
};
