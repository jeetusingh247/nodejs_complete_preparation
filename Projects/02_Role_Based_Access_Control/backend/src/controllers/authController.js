import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Role from "../models/Role.js";
import dotenv from "dotenv";
dotenv.config();

const createAccessToken = (user) => jwt.sign(
  { sub: user._id, roles: user.roles }, 
  process.env.ACCESS_TOKEN_SECRET, 
  { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "15m" }
);

const createRefreshToken = (user) => jwt.sign(
  { sub: user._id }, 
  process.env.REFRESH_TOKEN_SECRET, 
  { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || "7d" }
);

export const register = async (req, res) => {
  try {
    const { name, email, password, roleNames } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "User exists" });

    const hashed = await bcrypt.hash(password, 10);

    // Resolve role ids if roleNames provided
    let roles = [];
    if (roleNames && roleNames.length) {
      const rolesFound = await Role.find({ name: { $in: roleNames } });
      roles = rolesFound.map(r => r._id);
    }

    const user = await User.create({ name, email, password: hashed, roles });
    const userPop = await User.findById(user._id).populate("roles");

    res.status(201).json({ user: { id: user._id, email: user.email, roles: userPop.roles.map(r=>r.name) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email }).populate({ path: "roles", populate: { path: "permissions" } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Build tokens
    const accessToken = createAccessToken({ _id: user._id, roles: user.roles.map(r => r.name) });
    const refreshToken = createRefreshToken({ _id: user._id });

    // Set refresh token in httpOnly secure cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      path: "/"
    });

    // Return user and access token
    res.json({
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        roles: user.roles.map(r => r.name),
        permissions: [].concat(...user.roles.map(r => (r.permissions || []).map(p => p.name)))
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ message: "Missing refresh token" });

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid refresh token" });
      const userId = decoded.sub;
      const user = await User.findById(userId).populate("roles");
      if (!user) return res.status(404).json({ message: "User not found" });

      const accessToken = createAccessToken({ _id: user._id, roles: user.roles.map(r => r.name) });
      res.json({ accessToken, user: { id: user._id, email: user.email, roles: user.roles.map(r=>r.name) }});
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("refreshToken", { path: "/" });
  res.json({ message: "Logged out" });
};
