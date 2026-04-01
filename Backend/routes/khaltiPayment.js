const express = require("express");
const router = express.Router();
const axios = require("axios");
const StudentFee = require("../models/StudentFee");

// @route   POST /api/payment/khalti/initiate
// @desc    Initiate Khalti payment
router.post("/initiate", async (req, res) => {
  try {
    const { feeIds, studentId, amount, purchaseOrderId, studentName, studentEmail, studentPhone } = req.body;

    if (!feeIds || !amount || !purchaseOrderId) {
      return res.status(400).json({ message: "Missing required payment details" });
    }

    const payload = {
      return_url: `http://localhost:7000/api/payment/khalti/verify`,
      website_url: process.env.CLIENT_BASE_URL,
      amount: Math.round(amount), // Ensure integer (Paisa)
      purchase_order_id: purchaseOrderId,
      purchase_order_name: `Fees Payment for Student ${studentId}`,
      customer_info: {
        name: studentName || "Student",
        email: studentEmail || "test@example.com",
        phone: studentPhone || "9800000000",
      },
    };

    const response = await axios.post(
      `${process.env.KHALTI_BASE_URL}/epayment/initiate/`,
      payload,
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data && response.data.pidx) {
      // Store pidx in the fee records to track them
      await StudentFee.updateMany(
        { _id: { $in: feeIds } },
        { $set: { khaltiPidx: response.data.pidx } }
      );

      return res.json({
        pidx: response.data.pidx,
        payment_url: response.data.payment_url,
      });
    } else {
      return res.status(400).json({ message: "Failed to initiate payment with Khalti" });
    }
  } catch (error) {
    console.error("Khalti Initiate Error Details:", error.response?.data || error.message);
    res.status(500).json({
      message: "Internal Server Error during payment initiation",
      details: error.response?.data || error.message,
    });
  }
});

// @route   GET /api/payment/khalti/verify
// @desc    Verify Khalti payment (Callback URL)
router.get("/verify", async (req, res) => {
  const { pidx, status, transaction_id, amount, purchase_order_id } = req.query;

  try {
    if (!pidx || status !== "Completed") {
       // If it's not completed, redirect to failed
       return res.redirect(`${process.env.CLIENT_BASE_URL}/student/fee?payment=failed`);
    }

    // Verify with Khalti lookup
    const response = await axios.post(
      `${process.env.KHALTI_BASE_URL}/epayment/lookup/`,
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data && response.data.status === "Completed") {
      // Update StudentFee records
      const paidDate = new Date();
      
      const updateResult = await StudentFee.updateMany(
        { khaltiPidx: pidx },
        {
          $set: {
            status: "PAID",
            paymentMethod: "Khalti",
            paymentDate: paidDate,
            receiptNumber: transaction_id || response.data.transaction_id,
            transactionId: transaction_id || response.data.transaction_id,
          }
        }
      );

      // Fetch the updated records to set paidAmount correctly
      const fees = await StudentFee.find({ khaltiPidx: pidx });
      for (const fee of fees) {
        fee.paidAmount = fee.totalAmount;
        fee.dueAmount = 0;
        fee.status = "PAID";
        await fee.save();
      }

      return res.redirect(`${process.env.CLIENT_BASE_URL}/student/fee?payment=success`);
    } else {
      return res.redirect(`${process.env.CLIENT_BASE_URL}/student/fee?payment=failed`);
    }
  } catch (error) {
    console.error("Khalti Verify Error:", error.response?.data || error.message);
    res.redirect(`${process.env.CLIENT_BASE_URL}/student/fee?payment=failed`);
  }
});

module.exports = router;
