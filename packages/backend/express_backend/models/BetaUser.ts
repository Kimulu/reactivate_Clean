import mongoose from "mongoose";

const BetaUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  experience: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.BetaUser ||
  mongoose.model("BetaUser", BetaUserSchema);
