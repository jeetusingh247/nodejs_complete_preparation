import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
  isDeleted: { type: Boolean, default: false }, // soft delete
}, { timestamps: true });

export default mongoose.model("User", userSchema);
