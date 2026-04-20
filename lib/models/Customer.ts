import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICustomer extends Document {
  customerName: string;
  address: string;
  organization: string;
  region: string;
  branch: string;
  pinCode?: string;
  state?: string;
  district?: string;
  contactPersonName?: string;
  contactNo?: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema: Schema<ICustomer> = new Schema(
  {
    customerName: { type: String, required: true },
    address: { type: String, required: true },
    organization: { type: String, required: true },
    region: { type: String, required: true },
    branch: { type: String, required: true },
    pinCode: { type: String },
    state: { type: String },
    district: { type: String },
    contactPersonName: { type: String },
    contactNo: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

CustomerSchema.index({ region: 1, branch: 1 });
CustomerSchema.index({ organization: 1 });

const Customer: Model<ICustomer> = mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema);
export default Customer;
