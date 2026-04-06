// routes/statsRoutes.js
const express = require("express");
const router = express.Router();
const statsController = require("../controllers/statsController");
const { protect } = require("../middleware/authMiddleware");

router.get("/overview", protect, statsController.getOverviewStats);

module.exports = router;

