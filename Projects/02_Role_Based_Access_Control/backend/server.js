import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/auth.js";
import adminRoutes from "./src/routes/admin.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: (origin, cb) => {
    const allowed = [process.env.FRONTEND_URL, `http://localhost:${process.env.PORT || 4000}`];
    if (!origin || allowed.indexOf(origin) !== -1) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// serve a simple test client to exercise auth/admin endpoints
app.use(express.static("public"));

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api", adminRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error", error: err.message || err });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
