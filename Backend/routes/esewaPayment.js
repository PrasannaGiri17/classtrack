const express = require("express");
const router = express.Router();
const axios = require("axios");
const crypto = require("crypto");
const StudentFee = require("../models/StudentFee");

// Helper to generate signature
const generateSignature = (message) => {
  const secret = process.env.ESEWA_SECRET_KEY;
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(message);
  return hmac.digest("base64");
};

// @route   POST /api/payment/esewa/initiate
router.post("/initiate", async (req, res) => {
  try {
    const { feeIds, amount, purchaseOrderId } = req.body;

    if (!feeIds || !amount || !purchaseOrderId) {
      return res.status(400).json({ message: "Missing required payment details" });
    }

    // In eSewa, we'll use purchaseOrderId as transaction_uuid
    const totalAmount = amount;
    const productCode = process.env.ESEWA_MERCHANT_CODE || "EPAYTEST";
    
    const message = `total_amount=${totalAmount},transaction_uuid=${purchaseOrderId},product_code=${productCode}`;
    const signature = generateSignature(message);

    // Track pidx (uuid) in StudentFee records
    await StudentFee.updateMany(
      { _id: { $in: feeIds } },
      { $set: { khaltiPidx: purchaseOrderId } } // Reusing this field to store the UUID for lookup
    );

    res.json({
      amount,
      tax_amount: 0,
      total_amount: totalAmount,
      transaction_uuid: purchaseOrderId,
      product_code: productCode,
      product_service_charge: 0,
      product_delivery_charge: 0,
      success_url: `http://localhost:7000/api/payment/esewa/verify`,
      failure_url: `http://localhost:7000/api/payment/esewa/failure`,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature: signature,
      esewa_url: `${process.env.ESEWA_BASE_URL}/api/epay/main/v2/form`,
    });
  } catch (error) {
    console.error("eSewa Initiate Error:", error.message);
    res.status(500).json({ message: "Internal Server Error during eSewa initiation" });
  }
});

// @route   GET /api/payment/esewa/verify
router.get("/verify", async (req, res) => {
  try {
    const { data } = req.query;
    if (!data) {
      return res.redirect(`${process.env.CLIENT_BASE_URL}/student/fee?payment=failed`);
    }

    // Decode return data
    const decoded = JSON.parse(Buffer.from(data, "base64").toString());
    const { status, total_amount, transaction_uuid, transaction_code, signature } = decoded;

    if (status !== "COMPLETE") {
      return res.redirect(`${process.env.CLIENT_BASE_URL}/student/fee?payment=failed`);
    }

    // Verify signature manually (optional but recommended)
    // message = total_amount=100.0,transaction_uuid=11-001-502,product_code=EPAYTEST
    // ... logic for signature verification if needed ...

    // Official Verification with eSewa Transaction Status API
    const verifyResponse = await axios.get(
      `${process.env.ESEWA_BASE_URL}/api/epay/transaction/status/`,
      {
          params: {
              product_code: process.env.ESEWA_MERCHANT_CODE || "EPAYTEST",
              transaction_uuid: transaction_uuid,
              total_amount: total_amount
          }
      }
    );

    if (verifyResponse.data && verifyResponse.data.status === "COMPLETE") {
      // Update StudentFee records
      const fees = await StudentFee.find({ khaltiPidx: transaction_uuid });
      for (const fee of fees) {
        fee.paidAmount = fee.totalAmount;
        fee.dueAmount = 0;
        fee.status = "PAID";
        fee.paymentMethod = "eSewa";
        fee.paymentDate = new Date();
        fee.transactionId = transaction_code;
        await fee.save();
      }
      return res.redirect(`${process.env.CLIENT_BASE_URL}/student/fee?payment=success`);
    } else {
      return res.redirect(`${process.env.CLIENT_BASE_URL}/student/fee?payment=failed`);
    }
  } catch (error) {
    console.error("eSewa Verify Error:", error.message);
    res.redirect(`${process.env.CLIENT_BASE_URL}/student/fee?payment=failed`);
  }
});

// @route   GET /api/payment/esewa/failure
router.get("/failure", (req, res) => {
  res.redirect(`${process.env.CLIENT_BASE_URL}/student/fee?payment=failed`);
});

module.exports = router;
