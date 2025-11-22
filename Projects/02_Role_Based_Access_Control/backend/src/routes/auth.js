import express from "express";
import { register, login, refreshToken, logout } from "../controllers/authController.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

export default router;
