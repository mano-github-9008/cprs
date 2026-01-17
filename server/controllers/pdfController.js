const PDFDocument = require("pdfkit");
const Result = require("../models/Result");

exports.downloadReport = async (req, res) => {
  const result = await Result.findOne({ studentId: req.user.id });

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  doc.pipe(res);

  doc.fontSize(20).text("Career Assessment Report", { align: "center" });

  doc.moveDown();
  result.categoryScores.forEach((c) => {
    doc.text(`${c.category}: ${c.percentage}%`);
  });

  doc.moveDown();
  doc.text("Recommended Careers:");
  result.recommendedCareers.forEach((c) => doc.text(`• ${c}`));

  doc.end();
};
