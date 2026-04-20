import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVisitLog extends Document {
  visitDate: Date;
  customerId: mongoose.Types.ObjectId | any;
  productIds: mongoose.Types.ObjectId[] | any[];
  complaintNo?: string;
  complaintType?: string;
  complaintDate?: Date;
  complaintDescription?: string;
  actionTaken: string;
  visitedBy: string;
  status: "Open" | "In Progress" | "Closed";
  note?: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const VisitLogSchema: Schema<IVisitLog> = new Schema(
  {
    visitDate: { type: Date, required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    productIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    complaintNo: { type: String },
    complaintType: { type: String },
    complaintDate: { type: Date },
    complaintDescription: { type: String },
    actionTaken: { type: String, required: true },
    visitedBy: { type: String, required: true },
    status: { type: String, enum: ["Open", "In Progress", "Closed"], required: true, default: "Closed" },
    note: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

VisitLogSchema.index({ customerId: 1, visitDate: -1 });
VisitLogSchema.index({ productIds: 1 });
VisitLogSchema.index({ visitDate: -1 });

const VisitLog: Model<IVisitLog> = mongoose.models.VisitLog || mongoose.model<IVisitLog>("VisitLog", VisitLogSchema);
export default VisitLog;
