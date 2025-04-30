import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.webp";
import "../styles/styles.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    let users = JSON.parse(localStorage.getItem("users")) || {};
  
    // Try localStorage first
    let userEntry = Object.values(users).find(
      (u) => u.email === email && u.password === password
    );
  
    // If not found in localStorage, try fetching from users.json
    if (!userEntry) {
      try {
        const response = await fetch("/users.json");
        const userList = await response.json();
        userEntry = userList.find(
          (u) => u.email === email && u.password === password
        );
        if (userEntry) {
          users[userEntry.username] = userEntry;
          localStorage.setItem("users", JSON.stringify(users));
        }
      } catch (error) {
        console.error("Failed to fetch user.json:", error);
      }
    }
  
    if (userEntry) {
      localStorage.setItem("currentUser", userEntry.username);
      alert("Login successful!");
      navigate(`/profile/${userEntry.username}`); // ✅ fixed redirect
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="login-container">
      <img src={logo} alt="My Menu Logo" className="logo" />
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <div className="signup-box">
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Log in</button>
        </form>
        <div className="signup">
          <p>
            Don't have an account? <a href="/signup">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
