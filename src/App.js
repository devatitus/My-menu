import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import UserSettings from "./profile/UserSettings";
import UserProfile from "./profile/UserProfile";
import CustomerProfile from "./profile/CustomerProfile";
import Dashboard from "./components/Dashboard";
function App() {
  const currentUser = localStorage.getItem("currentUser");

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Registration Route (Only for new users) */}
        <Route path="/register/:username" element={<UserSettings />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={currentUser ? <Dashboard /> : <Navigate to="/" replace />}
        />
        
        {/* Dynamic Profile Route for user: /profile/:username */}
        <Route path="/profile/:username" element={<UserProfile />} />

        {/* Settings Route for a specific user: /settings/:username */}
        <Route
          path="/settings/:username"
          element={currentUser ? <UserSettings /> : <Navigate to="/" replace />}
        />

        {/* Public QR Menu Route for customers */}
        <Route path="/customerprofile/:username" element={<CustomerProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
