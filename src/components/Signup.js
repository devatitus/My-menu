import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Signup.css";
import logo from "../assets/logo.webp";

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { fullName, email, username, password, confirmPassword } = formData;

    if (!fullName || !email || !username || !password || !confirmPassword) {
      setError("All fields are required!");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || {};

    // Check for duplicate username
    if (users[username]) {
      setError("Username already exists!");
      return;
    }

    // Check for duplicate email
    const emailExists = Object.values(users).some(
      (user) => user.email === email
    );
    if (emailExists) {
      setError("Email already registered!");
      return;
    }

    users[username] = {
      fullName,
      email,
      username,
      password,
      profile: "https://placehold.co/120x120",
      background: "https://placehold.co/600x300",
      availability: "10:00 AM - 12:00 PM",
      location: "",
    };

    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", username);

    navigate(`/register/${encodeURIComponent(username)}`);
  };

  return (
    <div className="signup-container">
      <img src={logo} alt="My Menu Logo" className="logo" />
      <h2>Create an Account</h2>
      {error && <p className="error">{error}</p>}
      <div className="signup-box">
        <form onSubmit={handleSubmit}>
          <input type="text" name="fullName" placeholder="Full Name" onChange={handleChange} />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} />
          <input type="text" name="username" placeholder="Username" onChange={handleChange} />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} />
          <button type="submit">Sign Up</button>
        </form>
        <p>Already have an account? <a href="/">Log in</a></p>
      </div>
    </div>
  );
};

export default Signup;
