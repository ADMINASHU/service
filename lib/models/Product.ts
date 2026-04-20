import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  customerId: mongoose.Types.ObjectId | any; // allow populate
  type: string;
  rating?: string;
  dcVolt?: string;
  ah?: string;
  qty?: number;
  phase?: string;
  serialNo?: string;
  isAutoSerial: boolean;
  configuration?: string;
  batteryType?: string;
  make?: string;
  warrantyPeriod?: number; // months
  installationDate?: Date;
  amcStartDate?: Date;
  amcPeriod?: number; // months
  visitFrequency?: "monthly" | "quarterly" | "half-yearly" | "yearly" | null;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema<IProduct> = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    type: { type: String, required: true },
    rating: { type: String },
    dcVolt: { type: String },
    ah: { type: String },
    qty: { type: Number },
    phase: { type: String },
    serialNo: { type: String, sparse: true, unique: true },
    isAutoSerial: { type: Boolean, default: false },
    configuration: { type: String },
    batteryType: { type: String },
    make: { type: String },
    warrantyPeriod: { type: Number },
    installationDate: { type: Date },
    amcStartDate: { type: Date },
    amcPeriod: { type: Number },
    visitFrequency: { type: String, enum: ["monthly", "quarterly", "half-yearly", "yearly", null], default: null },
    note: { type: String },
  },
  { timestamps: true }
);

ProductSchema.index({ customerId: 1 });
ProductSchema.index({ type: 1 });

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
export default Product;
