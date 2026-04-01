const mongoose = require("mongoose");

const studentFeeSchema = new mongoose.Schema(
  {
    schoolId: { type: Number, required: true, index: true },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    school: {
      type: Number,
      ref: "School",
      required: true,
      default: 1,
    },
    grade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grade",
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    monthIndex: {
      type: Number,
      required: true, // 0 to 11
    },
    monthName: {
      type: String,
      required: true,
    },
    baseFee: {
      type: Number,
      required: true,
      default: 0,
    },
    admissionFee: {
      type: Number,
      default: 0,
    },
    extraFees: [
      {
        title: { type: String, required: true },
        amount: { type: Number, required: true, default: 0 },
      },
    ],
    discount: {
      type: Number,
      default: 0,
    },
    fine: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
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
      enum: ["UNPAID", "PARTIAL", "PAID", "OVERDUE"],
      default: "UNPAID",
    },
    paymentDate: {
      type: Date,
    },
    paymentMethod: {
      type: String, // e.g., Cash, E-Sewa, Bank Transfer
    },
    receiptNumber: {
      type: String,
    },
    remarks: {
      type: String,
    },
    khaltiPidx: {
      type: String,
    },
    transactionId: {
      type: String,
    },
  },
  { timestamps: true }
);

// Calculate totals before saving
studentFeeSchema.pre("save", function (next) {
  const extraTotal = this.extraFees.reduce((sum, item) => sum + item.amount, 0);
  
  this.totalAmount = this.baseFee + this.admissionFee + extraTotal + this.fine - this.discount;
  this.dueAmount = this.totalAmount - this.paidAmount;

  if (this.dueAmount <= 0) {
    this.status = "PAID";
    this.dueAmount = 0;
  } else if (this.paidAmount > 0) {
    this.status = "PARTIAL";
  } else {
    // Note: OVERDUE logic might need a dueDate field or a check against current date
    // For now defaulting to UNPAID if no payment made
    if (this.status !== "OVERDUE") {
        this.status = "UNPAID";
    }
  }

  next();
});

// Index for preventing duplicates
studentFeeSchema.index({ student: 1, monthIndex: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model("StudentFee", studentFeeSchema);
