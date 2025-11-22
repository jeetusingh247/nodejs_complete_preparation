import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "create:product"
  description: { type: String }
}, { timestamps: true });

export default mongoose.model("Permission", permissionSchema);
