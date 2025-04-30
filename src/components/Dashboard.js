import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Dashboard.css";
import logo from "../assets/logo.webp";

const Dashboard = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const storedUsers = localStorage.getItem("users");

    if (storedUsers) {
      try {
        const parsed = JSON.parse(storedUsers);
        if (typeof parsed === "object" && !Array.isArray(parsed)) {
          setUsers(Object.values(parsed));
        } else if (Array.isArray(parsed)) {
          setUsers(parsed);
        }
      } catch (err) {
        console.error("Failed to parse users:", err);
      }
    } else {
      fetch("/users.json")
        .then((res) => res.json())
        .then((data) => {
          setUsers(Array.isArray(data) ? data : Object.values(data));
        })
        .catch((err) => console.error("Failed to load users.json", err));
    }
  }, []);

  const handleDeleteUser = (username) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the account for ${username}? This action is permanent.`);
    if (confirmDelete) {
      try {
        const storedUsers = JSON.parse(localStorage.getItem("users"));
        if (storedUsers && storedUsers[username]) {
          delete storedUsers[username];
          localStorage.setItem("users", JSON.stringify(storedUsers));
          // Update state
          setUsers(Object.values(storedUsers));
          alert(`${username} has been deleted.`);
        }
      } catch (err) {
        console.error("Failed to delete user:", err);
        alert("An error occurred while deleting the user.");
      }
    }
  };

  return (
    <div className="dashboard-container">
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="table-wrapper">
          <img src={logo} alt="My Menu Logo" className="logo" />
          <h2>All Registered Users</h2>
          <table className="user-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Profile</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Username</th>
                <th>Location</th>
                <th>Availability</th>
                <th>Customer Profile</th> {/* New column */}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    <img
                      src={user.profile}
                      alt="Profile"
                      className="table-profile-img"
                    />
                  </td>
                  <td>{user.fullName || "N/A"}</td>
                  <td>{user.email}</td>
                  <td>
                    <Link to={`/profile/${encodeURIComponent(user.username)}`}>
                      {user.username}
                    </Link>
                  </td>
                  <td>{user.location || "N/A"}</td>
                  <td>{user.availability || "N/A"}</td>
                  <td>
                    <Link to={`/customerprofile/${encodeURIComponent(user.username)}`}>
                      View Profile
                    </Link>
                  </td> {/* Link to CustomerProfile.js */}
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteUser(user.username)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
