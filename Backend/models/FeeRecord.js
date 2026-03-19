const mongoose = require("mongoose");

const feeRecordSchema = new mongoose.Schema(
  {
    schoolId: { type: Number, required: true, index: true },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    schoolId: {
      type: Number, 
      required: true,
    },
    academicYear: {
      type: String,
      required: true, 
    },
    monthName: {
      type: String,
      required: true,
    },
    monthIndex: {
      type: Number,
      required: true, 
    },
    baseFee: {
      type: Number,
      default: 0
    },
    admissionFee: {
      type: Number,
      default: 0
    },
    extraFees: [
      {
        title: String,
        amount: Number
      }
    ],
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    dueAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["PAID", "PARTIAL", "UNPAID", "OVERDUE"],
      default: "UNPAID",
    },
    paymentDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      enum: ["CASH", "ONLINE", "BANK"],
    },
    receiptNumber: {
      type: String,
    },
  },
  { timestamps: true }
);

// Auto-calculate dueAmount and status before saving
feeRecordSchema.pre("save", function (next) {
  this.dueAmount = Math.max(0, this.totalAmount - this.paidAmount);

  if (this.paidAmount === 0) {
    this.status = "UNPAID";
  } else if (this.dueAmount > 0) {
    this.status = "PARTIAL";
  } else {
    this.status = "PAID";
  }
  next();
});

// Prevent duplicate records for the same student/month/year
feeRecordSchema.index({ student: 1, academicYear: 1, monthIndex: 1 }, { unique: true });

module.exports = mongoose.model("FeeRecord", feeRecordSchema);
