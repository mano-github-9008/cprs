const Assessment = require("../models/Assessment");
const Result = require("../models/Result");
const StudentProfile = require("../models/StudentProfile");
const careerEngine = require("../utils/careerEngine");

/* ======================================================
   SUBMIT ASSESSMENT (HARD LOCK + AI EXPLANATION)
====================================================== */
exports.submitAssessment = async (req, res) => {
  try {
    const { answers, timeSpent } = req.body;
    const studentId = req.user.id;
    const batchId = req.user.batchId;

    /* ================= HARD GUARDS ================= */

    if (!batchId) {
      return res.status(400).json({
        message: "Student is not assigned to any batch",
      });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        message: "Answers must be an array",
      });
    }

    /* ================= HARD LOCK ================= */
    const existing = await Result.findOne({ studentId, batchId });
    if (existing) {
      return res.status(403).json({
        message: "Assessment already submitted. One attempt only.",
      });
    }

    /* ================= FETCH ASSESSMENT ================= */
    const assessment = await Assessment.findOne({ batchId });
    if (!assessment || !assessment.questions || assessment.questions.length === 0) {
      return res.status(404).json({
        message: "Assessment not available for this batch",
      });
    }

    /* ================= FETCH STUDENT PROFILE ================= */
    const profile = await StudentProfile.findOne({ userId: studentId });
    if (!profile) {
      return res.status(400).json({
        message: "Complete your profile before submitting assessment",
      });
    }

    /* ================= SCORE CALCULATION ================= */
    const categoryScoresMap = {};
    let totalCorrect = 0;

    assessment.questions.forEach((q, index) => {
      const category = q.category;

      if (!categoryScoresMap[category]) {
        categoryScoresMap[category] = { correct: 0, total: 0 };
      }

      categoryScoresMap[category].total++;

      if (answers[index] === q.correctAnswer) {
        categoryScoresMap[category].correct++;
        totalCorrect++;
      }
    });

    const categoryScores = Object.entries(categoryScoresMap).map(
      ([category, c]) => ({
        category,
        correct: c.correct,
        total: c.total,
        percentage: Math.round((c.correct / c.total) * 100),
      })
    );

    /* ================= AI CAREER ENGINE ================= */
    const studentLevel = profile.education || "UG";

    const {
      strengths = [],
      weaknesses = [],
      explanations = [],
      improvementSuggestions = [],
      recommendedCareers = [],
    } = careerEngine(categoryScores, studentLevel);

    /* 🔒 FIX: normalize weaknesses to match Result schema */
    const normalizedWeaknesses = weaknesses.map((w) => {
      if (typeof w === "string") {
        return {
          category: w,
          reason: "Needs improvement",
          improvementTips: [],
        };
      }
      return w;
    });

    /* ================= SAVE RESULT ================= */
    const result = await Result.create({
      studentId,
      batchId,
      assessmentId: assessment._id,

      categoryScores,
      totalCorrect,
      totalQuestions: assessment.questions.length,
      overallPercentage: Math.round(
        (totalCorrect / assessment.questions.length) * 100
      ),

      strengths,
      weaknesses: normalizedWeaknesses,
      explanations,
      improvementSuggestions,
      recommendedCareers,

      timeSpent: Number(timeSpent) || 0,
      attempt: 1,
      isLocked: true,
    });

    res.json({
      message: "Assessment submitted successfully",
      result,
    });
  } catch (err) {
    console.error("SUBMIT ERROR:", err);
    res.status(500).json({
      message: "Failed to submit assessment",
    });
  }
};

/* ======================================================
   GET MY RESULT (STUDENT)
====================================================== */
exports.getMyResult = async (req, res) => {
  try {
    const result = await Result.findOne({
      studentId: req.user.id,
      batchId: req.user.batchId,
    }).sort({ createdAt: -1 });

    if (!result) {
      return res.json({
        locked: true,
        message: "Result not available yet",
      });
    }

    res.json(result);
  } catch (err) {
    console.error("GET RESULT ERROR:", err);
    res.json({
      locked: true,
      message: "Failed to fetch result",
    });
  }
};

/* ======================================================
   ADMIN – BATCH ANALYTICS
====================================================== */
exports.getBatchAnalytics = async (req, res) => {
  try {
    const { batchId } = req.params;
    const results = await Result.find({ batchId });

    if (!results.length) {
      return res.json({
        submissions: 0,
        averageScore: 0,
        categoryAverages: [],
      });
    }

    let total = 0;
    const categoryMap = {};

    results.forEach((r) => {
      total += r.overallPercentage;

      r.categoryScores.forEach((c) => {
        if (!categoryMap[c.category]) {
          categoryMap[c.category] = { sum: 0, count: 0 };
        }
        categoryMap[c.category].sum += c.percentage;
        categoryMap[c.category].count++;
      });
    });

    const categoryAverages = Object.keys(categoryMap).map((cat) => ({
      category: cat,
      averagePercentage: Math.round(
        categoryMap[cat].sum / categoryMap[cat].count
      ),
    }));

    res.json({
      submissions: results.length,
      averageScore: Math.round(total / results.length),
      categoryAverages,
    });
  } catch (err) {
    console.error("ANALYTICS ERROR:", err);
    res.status(500).json({
      message: "Failed to fetch analytics",
    });
  }
};
