import mongoose from "mongoose";

const SettingSchema = new mongoose.Schema({
  key: { 
    type: String, 
    required: true, 
    unique: true,
    enum: ['productTypes', 'states', 'organizations', 'regions', 'branches']
  },
  values: [{ type: String }]
}, { timestamps: true });

export default mongoose.models.Setting || mongoose.model("Setting", SettingSchema);
