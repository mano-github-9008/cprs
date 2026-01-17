const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/* 🔹 Generate AI Questions */
router.get("/generate", async (req, res) => {
  try {
    const prompt = `
Generate 5 career assessment questions.
Questions should assess interests, skills, and thinking style.
Return ONLY a JSON array of strings.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ questions: JSON.parse(text) });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate questions" });
  }
});

/* 🔹 Evaluate Answers */
router.post("/evaluate", async (req, res) => {
  try {
    const { answers } = req.body;

    const prompt = `
Analyze the following answers and recommend:
1. Best career path
2. Two alternative careers
3. Short explanation

Answers:
${JSON.stringify(answers)}
`;

    const result = await model.generateContent(prompt);

    res.json({ recommendation: result.response.text() });
  } catch (err) {
    res.status(500).json({ error: "Evaluation failed" });
  }
});

module.exports = router;
