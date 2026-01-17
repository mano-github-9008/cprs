/**
 * Advanced Career Engine
 * - Identifies strengths & weaknesses
 * - Explains why the student IS / IS NOT fit
 * - Gives improvement suggestions
 * - Outputs clean text suitable for UI + PDF
 */

module.exports = function careerEngine(categoryScores) {
    const strengths = [];
    const weaknesses = [];
    const explanations = [];
    const improvementSuggestions = [];
    const careers = new Set();
  
    categoryScores.forEach((c) => {
      const category = c.category;
      const score = c.percentage;
  
      /* ================= STRONG AREA ================= */
      if (score >= 70) {
        strengths.push(category);
  
        switch (category.toLowerCase()) {
          case "logical":
            explanations.push(
              "You demonstrate strong logical reasoning and analytical thinking, which is essential for data-driven and research-oriented roles."
            );
            careers.add("Data Analyst");
            careers.add("Business Analyst");
            careers.add("Research Analyst");
            break;
  
          case "technical":
            explanations.push(
              "Your technical skills indicate a solid understanding of systems and problem-solving using technology."
            );
            careers.add("Software Engineer");
            careers.add("AI Engineer");
            careers.add("System Architect");
            break;
  
          case "communication":
            explanations.push(
              "You possess effective communication and interpersonal skills, which are critical for leadership and people-facing roles."
            );
            careers.add("HR Specialist");
            careers.add("Marketing Strategist");
            careers.add("Public Relations Manager");
            break;
  
          case "problem solving":
          case "problemsolving":
            explanations.push(
              "Your problem-solving ability shows that you can break down complex challenges and find structured solutions."
            );
            careers.add("Product Manager");
            careers.add("Consultant");
            careers.add("Operations Analyst");
            break;
  
          default:
            explanations.push(
              `You performed well in ${category}, indicating a strong aptitude in this area.`
            );
            careers.add("General Analyst");
        }
      }
  
      /* ================= WEAK AREA ================= */
      else {
        weaknesses.push(category);
  
        explanations.push(
          `Your score in ${category} is below the recommended level, indicating that this area may currently limit your suitability for roles heavily dependent on it.`
        );
  
        improvementSuggestions.push(
          `To improve in ${category}, consider focused practice, guided learning resources, and real-world exercises related to this skill.`
        );
      }
    });
  
    /* ================= OVERALL BALANCE ================= */
    if (!strengths.length) {
      explanations.push(
        "Your current performance suggests the need for foundational skill development before specializing in a specific career path."
      );
      improvementSuggestions.push(
        "Start with strengthening core skills such as logical thinking, communication, and basic technical concepts."
      );
    }
  
    if (!careers.size) {
      careers.add("Skill Development Program");
    }
  
    return {
      strengths,
      weaknesses,
      explanations,
      improvementSuggestions,
      careers: [...careers],
    };
  };
  