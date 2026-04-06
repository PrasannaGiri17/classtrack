const jwt = require("jsonwebtoken");
const User = require("../models/UserModal");

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized to access this route" });
    }

    // Verify token
    if (!process.env.JWT_SECRET) {
      console.error("CRITICAL ERROR: JWT_SECRET is missing from process.env");
      return res.status(500).json({ message: "Internal server authentication error" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Support Super Admin token isolation
    if (decoded.role === 'superadmin') {
      req.user = { id: decoded.id, role: 'superadmin' };
      req.schoolId = null; // Super admins don't have a single school constraint
      return next();
    }

    // Standard Multi-Tenant User check
    const User = require("../models/UserModal"); // Use local require to avoid circular or early access issues if needed
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({ message: "The user belonging to this token no longer exists" });
    }

    // Grant access to protected route
    req.user = currentUser;
    req.schoolId = currentUser.schoolId || decoded.schoolId; // Attach multi-tenant ID
    next();

  } catch (err) {
    console.error("AUTH ERROR:", err);
    return res.status(401).json({ message: "Token is invalid or expired" });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};
