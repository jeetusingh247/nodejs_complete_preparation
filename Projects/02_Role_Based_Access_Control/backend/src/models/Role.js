import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "Admin"
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }],
}, { timestamps: true });

export default mongoose.model("Role", roleSchema);
