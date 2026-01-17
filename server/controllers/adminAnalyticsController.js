const Result = require("../models/Result");

exports.getBatchAnalytics = async (req, res) => {
  const { batchId } = req.params;

  const results = await Result.find({ batchId });

  const avg =
    results.reduce((sum, r) => sum + r.overallPercentage, 0) /
    results.length;

  res.json({
    totalStudents: results.length,
    averageScore: Math.round(avg),
    results,
  });
};
