import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();
connectDB();  // ⭐ DB connect ho jayega yahan

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/payment", paymentRoutes);

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
