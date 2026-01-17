const multer = require("multer");
const fs = require("fs");
const path = require("path");

/* ===============================
   ENSURE UPLOADS FOLDER EXISTS
================================ */
const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* ===============================
   STORAGE CONFIG
================================ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

/* ===============================
   MULTER INSTANCE
================================ */
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files allowed"), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = upload;
