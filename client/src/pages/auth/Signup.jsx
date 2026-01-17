import { useState } from "react";
import { signupUser } from "../../services/authApi";
import "./Signup.css";


const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    const data = await signupUser(form);
    console.log(data);
    alert(data.message);
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        <h2>Create Account</h2>

        <input name="name" placeholder="Full Name" onChange={handleChange} />
        <input name="email" placeholder="Email" onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} />

        <select name="role" onChange={handleChange}>
          <option value="student">Student</option>
          <option value="admin">Admin</option>
          <option value="superadmin">Super Admin</option>
        </select>

        <button onClick={handleSignup}>Create Account</button>
      </div>
    </div>
  );
};

export default Signup;
