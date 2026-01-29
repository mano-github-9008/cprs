import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveStudentProfile } from "../../services/studentApi";
import { toast } from "react-toastify";
import "./StudentProfile.css";


const StudentProfile = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    phone: "",
    age: "",
    gender: "",
    education: "",
    stream: "",
    personalityType: "",
    city: "",
    state: "",
    interests: "",
    skills: "",
    careerGoal: "",
  });

  const [errors, setErrors] = useState({});

  const educationNeedsStream = ["12th", "UG", "PG", "Post PG"].includes(
    form.education
  );

  const validate = () => {
    const newErrors = {};

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      newErrors.phone = "Enter valid 10-digit phone number";
    }

    if (!form.age || form.age < 10 || form.age > 100) {
      newErrors.age = "Enter a valid age";
    }

    if (!form.gender) newErrors.gender = "Gender is required";
    if (!form.education) newErrors.education = "Education is required";
    if (educationNeedsStream && !form.stream.trim()) {
      newErrors.stream = "Stream is required";
    }
    if (!form.skills.trim()) newErrors.skills = "Skills are required";
    if (!form.careerGoal.trim()) {
      newErrors.careerGoal = "Career goal is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await saveStudentProfile({
        phone: form.phone,
        age: Number(form.age),
        gender: form.gender.toLowerCase(), // ✅ FIX
        education: form.education,
        stream: form.stream || null,
        personalityType: form.personalityType || null,
        city: form.city || null,
        state: form.state || null,
        interests: form.interests || null,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        careerGoal: form.careerGoal,
      });

      toast.success("Profile completed successfully");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to save profile"
      );
    }
  };

  // ... (keep your logic as is)

return (
  <div className="profile-page">
    <div className="profile-container">
      <h2>Complete Your Profile</h2>
      <p className="subtitle">Help us personalize your career recommendations</p>
      
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <div className="form-group">
          <label>Phone Number *</label>
          <input
            value={form.phone}
            placeholder="9876543210"
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          {errors.phone && <p className="error">{errors.phone}</p>}
        </div>

        <div className="form-group">
          <label>Age *</label>
          <input
            type="number"
            value={form.age}
            placeholder="20"
            onChange={(e) => setForm({ ...form, age: e.target.value })}
          />
          {errors.age && <p className="error">{errors.age}</p>}
        </div>

        <div className="form-group">
          <label>Gender *</label>
          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && <p className="error">{errors.gender}</p>}
        </div>

        <div className="form-group">
          <label>Education Level *</label>
          <select
            value={form.education}
            onChange={(e) => setForm({ ...form, education: e.target.value, stream: "" })}
          >
            <option value="">Select Education</option>
            <option value="10th">10th</option>
            <option value="12th">12th</option>
            <option value="UG">UG</option>
            <option value="PG">PG</option>
            <option value="Post PG">Post PG</option>
          </select>
          {errors.education && <p className="error">{errors.education}</p>}
        </div>

        {educationNeedsStream && (
          <div className="form-group">
            <label>Stream *</label>
            <input
              value={form.stream}
              placeholder="e.g. Computer Science"
              onChange={(e) => setForm({ ...form, stream: e.target.value })}
            />
            {errors.stream && <p className="error">{errors.stream}</p>}
          </div>
        )}

        <div className="form-group">
          <label>Personality Type</label>
          <select
            value={form.personalityType}
            onChange={(e) => setForm({ ...form, personalityType: e.target.value })}
          >
            <option value="">Select Personality</option>
            <option value="Introvert">Introvert</option>
            <option value="Extrovert">Extrovert</option>
            <option value="Ambivert">Ambivert</option>
          </select>
        </div>

        <div className="form-group">
          <label>City</label>
          <input
            value={form.city}
            placeholder="City"
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>State</label>
          <input
            value={form.state}
            placeholder="State"
            onChange={(e) => setForm({ ...form, state: e.target.value })}
          />
        </div>

        <div className="form-group full-width">
          <label>Skills * (Comma separated)</label>
          <input
            value={form.skills}
            placeholder="React, Python, Public Speaking"
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
          />
          {errors.skills && <p className="error">{errors.skills}</p>}
        </div>

        <div className="form-group full-width">
          <label>Interests & Hobbies</label>
          <textarea
            value={form.interests}
            placeholder="What do you love doing in your free time?"
            onChange={(e) => setForm({ ...form, interests: e.target.value })}
          />
        </div>

        <div className="form-group full-width">
          <label>Career Goal *</label>
          <textarea
            value={form.careerGoal}
            placeholder="Where do you see yourself in 5 years?"
            onChange={(e) => setForm({ ...form, careerGoal: e.target.value })}
          />
          {errors.careerGoal && <p className="error">{errors.careerGoal}</p>}
        </div>

        <button type="submit" className="submit-btn">Save & Continue</button>
      </form>
    </div>
  </div>
);
};

export default StudentProfile;
