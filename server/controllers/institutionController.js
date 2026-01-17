const Institution = require("../models/Institution");

/* ======================================================
   CREATE INSTITUTION (ADMIN ONLY)
   POST /api/institution/create
====================================================== */
exports.createInstitution = async (req, res) => {
  try {
    const { name, code, address, website } = req.body;

    /* 🔒 Only admin / superadmin */
    if (!["admin", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    if (!name || !code) {
      return res.status(400).json({
        message: "Institution name and code are required",
      });
    }

    /* 🚫 One institution per admin */
    const existing = await Institution.findOne({
      createdBy: req.user.id,
    });

    if (existing) {
      return res.status(400).json({
        message: "Institution already exists for this admin",
      });
    }

    /* 🚫 Unique institution code */
    const codeExists = await Institution.findOne({ code });

    if (codeExists) {
      return res.status(400).json({
        message: "Institution code already exists",
      });
    }

    const institution = await Institution.create({
      name,
      code,
      address,
      website,
      createdBy: req.user.id,
    });

    res.status(201).json({
      message: "Institution created successfully",
      institution,
    });
  } catch (err) {
    console.error("CREATE INSTITUTION ERROR:", err.message);
    res.status(500).json({
      message: "Failed to create institution",
    });
  }
};

/* ======================================================
   GET ADMIN'S INSTITUTION
   GET /api/institution/my
====================================================== */
exports.getMyInstitution = async (req, res) => {
  try {
    const institution = await Institution.findOne({
      createdBy: req.user.id,
    });

    if (!institution) {
      return res.json({ institution: null });
    }

    res.json({ institution });
  } catch (err) {
    console.error("GET INSTITUTION ERROR:", err.message);
    res.status(500).json({
      message: "Failed to fetch institution",
    });
  }
};

/* ======================================================
   GET ALL ACTIVE INSTITUTIONS (STUDENTS)
   GET /api/institution/active
====================================================== */
exports.getActiveInstitutions = async (req, res) => {
  try {
    const institutions = await Institution.find({
      isActive: true,
    }).select("name code");

    res.json({ institutions });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch institutions",
    });
  }
};
