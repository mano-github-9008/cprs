const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  generateAndStoreAssessment,
  rollbackAssessment,
} = require("../controllers/aiController");

/* ===============================
   GENERATE AI ASSESSMENT
================================ */
router.post(
  "/generate-assessment",
  protect,
  upload.single("pdf"),
  (req, res, next) => {
    try {
      if (!req.body || !req.body.payload) {
        return res.status(400).json({
          message: "Payload missing in request",
        });
      }

      // ✅ PARSE payload once here
      req.parsedPayload = JSON.parse(req.body.payload);

      next();
    } catch (err) {
      return res.status(400).json({
        message: "Invalid payload format",
      });
    }
  },
  generateAndStoreAssessment
);


/* ===============================
   ROLLBACK ASSESSMENT
================================ */
router.delete("/rollback/:id", protect, rollbackAssessment);

module.exports = router;
