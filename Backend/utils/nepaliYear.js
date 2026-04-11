/**
 * nepaliYear.js
 * Returns the current Nepali (BS) year without any external library.
 *
 * Logic:
 *   Nepali New Year (Baisakh 1) falls on ~April 14 each AD year.
 *   - On / after April 14  →  BS year = AD year + 57
 *   - Before  April 14     →  BS year = AD year + 56
 *
 * Verified:
 *   Baisakh 1, 2082 BS = April 14, 2025 AD  → 2025 + 57 = 2082 ✓
 *   Baisakh 1, 2083 BS = April 14, 2026 AD  → 2026 + 57 = 2083 ✓
 */
function getCurrentNepaliYear() {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-indexed
  const day   = now.getDate();

  // Nepali New Year starts on or around April 14
  const afterNewYear = month > 4 || (month === 4 && day >= 14);
  return now.getFullYear() + (afterNewYear ? 57 : 56);
}

module.exports = { getCurrentNepaliYear };
