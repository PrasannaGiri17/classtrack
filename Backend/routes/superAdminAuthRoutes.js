const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const router = express.Router();

// 1. Definition of Model isolated inside this same routing page
const superAdminSchema = new mongoose.Schema({
  name: { type: String, default: "System Administrator" },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { collection: 'superadmins' });

// Create model safely avoiding redefine errors
const SuperAdmin = mongoose.models.SuperAdmin || mongoose.model('SuperAdmin', superAdminSchema);

// Initial un-joined superadmin seeder for system first-time access
async function seedSuperAdmin() {
  try {
    const count = await SuperAdmin.countDocuments();
    if (count === 0) {
      await SuperAdmin.create({
        name: 'Master Super Admin',
        username: 'superadmin',
        password: 'classtrack_admin2026'
      });
      console.log("Seeded default super admin => username: 'superadmin', password: 'classtrack_admin2026'");
    } else {
      // Re-seed password to plain text if it was previously hashed during earlier setup
      await SuperAdmin.updateOne(
        { username: 'superadmin' },
        { password: 'classtrack_admin2026' }
      );
    }
  } catch(e) { console.error("Super Admin seed error:", e); }
}
seedSuperAdmin();

// 2. Inline Login Controller & Endpoint (/api/superadmin/login)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const admin = await SuperAdmin.findOne({ username });
    if (!admin) {
      return res.status(404).json({ message: "Invalid username or password" });
    }

    const isMatch = (password === admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Completely isolated token containing no multi-tenant fields linking back to UserModal.js
    const token = jwt.sign(
      { id: admin._id, role: 'superadmin' }, 
      process.env.JWT_SECRET || 'superadmin_fallback_secret', 
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      message: "Authentication successful",
      token,
      user: {
        name: admin.name,
        username: admin.username,
        role: 'superadmin'
      }
    });

  } catch (error) {
    console.error("SuperAdmin login endpoint error:", error);
    res.status(500).json({ message: "Server error during super admin authentication." });
  }
});

module.exports = router;
