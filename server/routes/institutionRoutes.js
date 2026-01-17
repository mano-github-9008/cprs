const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  createInstitution,
  getMyInstitution,
  getActiveInstitutions,
} = require("../controllers/institutionController");

/* ======================================================
   CREATE INSTITUTION (ADMIN)
   POST /api/institution/create
====================================================== */
router.post("/create", protect, createInstitution);

/* ======================================================
   GET LOGGED-IN ADMIN INSTITUTION
   GET /api/institution/my
====================================================== */
router.get("/my", protect, getMyInstitution);

/* ======================================================
   GET ACTIVE INSTITUTIONS (STUDENT)
   GET /api/institution/list
====================================================== */
router.get("/list", getActiveInstitutions);

module.exports = router;
