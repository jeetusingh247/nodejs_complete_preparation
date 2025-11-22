import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Permission from "../models/Permission.js";
import Role from "../models/Role.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const MONGO = process.env.MONGO_URI;

const run = async () => {
  await mongoose.connect(MONGO);
  console.log("Connected to Mongo");

  // Clear (be careful on prod)
  // await Permission.deleteMany({});
  // await Role.deleteMany({});
  // await User.deleteMany({});

  // Create permissions
  const perms = [
    { name: "create:product" },
    { name: "update:product" },
    { name: "delete:product" },
    { name: "delete:user" },
    { name: "view:reports" }
  ];

  const createdPerms = [];
  for (const p of perms) {
    let doc = await Permission.findOne({ name: p.name });
    if (!doc) doc = await Permission.create(p);
    createdPerms.push(doc);
  }
  console.log("Permissions ready");

  // Create roles
  const roles = [
    { name: "Admin", permissions: createdPerms.map(p => p._id) },
    { name: "Manager", permissions: createdPerms.filter(p => ["create:product","update:product","view:reports"].includes(p.name)).map(p => p._id) },
    { name: "User", permissions: [] }
  ];

  for (const r of roles) {
    let doc = await Role.findOne({ name: r.name });
    if (!doc) doc = await Role.create(r);
  }
  console.log("Roles ready");

  // Create admin user
  const adminEmail = "admin@example.com";
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const hashed = await bcrypt.hash("Admin@123", 10);
    const adminRole = await Role.findOne({ name: "Admin" });
    admin = await User.create({ name: "Super Admin", email: adminEmail, password: hashed, roles: [adminRole._id] });
    console.log("Admin user created:", adminEmail, "password: Admin@123");
  } else {
    console.log("Admin exists");
  }

  mongoose.disconnect();
  console.log("Seed finished");
};

run().catch(err => {
  console.error(err);
  mongoose.disconnect();
});
