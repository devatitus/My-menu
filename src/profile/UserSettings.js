import React, { useState, useEffect } from "react";
import "../styles/UserSettings.css";
import { useNavigate, useParams, useLocation } from "react-router-dom";  // Changed from useLocation to useParams
import logo from "../assets/logo.webp";

const convertToDMS = (lat, lng) => {
  const toDMS = (deg, isLat) => {
    const absolute = Math.abs(deg);
    const degrees = Math.floor(absolute);
    const minutes = Math.floor((absolute - degrees) * 60);
    const seconds = (((absolute - degrees) * 60 - minutes) * 60).toFixed(1);
    const direction = deg >= 0 ? (isLat ? "N" : "E") : (isLat ? "S" : "W");
    return `${degrees}°${String(minutes).padStart(2, '0')}'${String(seconds).padStart(4, '0')}"${direction}`;
  };
  return `${toDMS(lat, true)} ${toDMS(lng, false)}`;
};

const convertTo24Hour = (timeStr) => {
  if (!timeStr) return "";
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const convertToAMPM = (time) => {
  if (!time) return "";
  const [hour, minute] = time.split(":");
  const h = parseInt(hour);
  const suffix = h >= 12 ? "PM" : "AM";
  const adjustedHour = ((h + 11) % 12) + 1;
  return `${adjustedHour}:${minute} ${suffix}`;
};

const UserSettings = () => {
  const { username } = useParams();  // Get the username from URL
  const [profileImage, setProfileImage] = useState("");
  const [backgroundImage, setBackgroundImage] = useState("");
  const [userName, setUserName] = useState(username);  // Set the username from URL
  const [openingTime, setOpeningTime] = useState("");
  const [closingTime, setClosingTime] = useState("");
  const [userLocation, setUserLocation] = useState("");
  const location = useLocation(); // Add this line
  const isRegisterMode = location.pathname === `/register/${encodeURIComponent(username)}`;

  const navigate = useNavigate();

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("users")) || {};
    const userData = users[username];

    if (!userData) {
      navigate("/");
      return;
    }

    setProfileImage(userData.profile || "");
    setBackgroundImage(userData.background || "");
    setUserName(username);  // Ensure username is set properly
    setUserLocation(userData.location || "");

    if (userData.availability) {
      const [openAMPM = "", closeAMPM = ""] = userData.availability.split(" - ");
      setOpeningTime(convertTo24Hour(openAMPM));
      setClosingTime(convertTo24Hour(closeAMPM));
    }
  }, [username, navigate]);  // Update when the username changes

  const handleSave = () => {
    const users = JSON.parse(localStorage.getItem("users")) || {};
    const availability = `${convertToAMPM(openingTime)} - ${convertToAMPM(closingTime)}`;

    users[username] = {
      ...users[username],
      profile: profileImage,
      background: backgroundImage,
      username,
      availability,
      location: userLocation
    };

    localStorage.setItem("users", JSON.stringify(users));
    navigate(`/profile/${encodeURIComponent(username)}`);
  };

  const handleCancel = () => {
    if (isRegisterMode) {
      alert("You must register to proceed.");
    } else {
      navigate(`/profile/${encodeURIComponent(username)}`);
    }
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBackgroundImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAutoDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const coords = convertToDMS(lat, lng);
          setUserLocation(coords);
          alert("Location auto-filled");
        },
        () => alert("Unable to access your location.")
      );
    } else {
      alert("Geolocation not supported.");
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-border">
        <img src={logo} alt="My Menu Logo" className="logo" />
        <h2>{isRegisterMode ? "USER REGISTRATION" : "UPDATE PROFILE"}</h2>

        <label><strong>Profile Image</strong></label>
        <div className="image-uploads">
          <label className="image-boxs">
            {profileImage ? <img src={profileImage} alt="Profile" className="preview-images" /> : <span>+</span>}
            <input type="file" accept="image/*" onChange={handleProfileImageUpload} hidden />
          </label>
        </div>

        <label><strong>Background Image</strong></label>
        <div className="image-uploads">
          <label className="image-boxs">
            {backgroundImage ? <img src={backgroundImage} alt="Background" className="preview-images" /> : <span>+</span>}
            <input type="file" accept="image/*" onChange={handleBackgroundImageUpload} hidden />
          </label>
        </div>

        <label><strong>User Name</strong></label>
        <div className="post-header-name">
          <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} />
        </div>

        <label><strong>Timing</strong></label>
        <div className="hoteltiming" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input type="time" value={openingTime} onChange={(e) => setOpeningTime(e.target.value)} />
          <span>to</span>
          <input type="time" value={closingTime} onChange={(e) => setClosingTime(e.target.value)} />
        </div>

        <label><strong>Location Coordinates</strong></label>
        <div className="location">
          <input
            type="text"
            value={userLocation}
            onChange={(e) => setUserLocation(e.target.value)}
            placeholder="enter the coordinate"
            className="mt-2 mb-4 p-2 rounded-md border w-full"
          />
          <button className="save-btn" onClick={handleAutoDetectLocation}>Auto</button>
        </div>

        <div className="settings-buttons">
          <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
          <button className="save-btn" onClick={handleSave}>{isRegisterMode ? "OK" : "Save"}</button>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
