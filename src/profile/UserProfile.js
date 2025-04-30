import React, { useState, useEffect } from "react";
import "../styles/UserProfile.css";
import AddPostModal from "./AddPostModal";
import { useNavigate, useParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { v4 as uuidv4 } from "uuid";
import {
  LocateFixed,
  MapPinPlus,
  Menu,
  ScanQrCode,
  Settings,
  House,
  LogOut
} from "lucide-react";

const UserProfile = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [editingPostData, setEditingPostData] = useState(null);
  const [user, setUser] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Get username from URL params
  const { username: urlUsername } = useParams();

  useEffect(() => {
    const decodedUsername = urlUsername ? decodeURIComponent(urlUsername) : localStorage.getItem("currentUser");
    const users = JSON.parse(localStorage.getItem("users")) || {};
    const userData = users[decodedUsername];

    if (userData) {
      setUser(userData);
      const userPosts = JSON.parse(localStorage.getItem(`${decodedUsername}_posts`)) || [];
      setPosts(userPosts);
    } else {
      alert("User not found.");
      navigate("/");
    }
  }, [urlUsername, navigate]);

  const savePostsToLocalStorage = (updatedPosts) => {
    try {
      localStorage.setItem(`${user.username}_posts`, JSON.stringify(updatedPosts));
    } catch (error) {
      console.error("Error saving posts:", error);
    }
  };

  const handleAddPost = (newPost) => {
    let updatedPosts;
    if (editingPostData && editingPostData.id) {
      updatedPosts = posts.map((post) =>
        post.id === editingPostData.id ? { ...newPost, id: post.id } : post
      );
    } else {
      updatedPosts = [...posts, { ...newPost, id: uuidv4() }];
    }

    setPosts(updatedPosts);
    savePostsToLocalStorage(updatedPosts);
    setIsModalOpen(false);
    setEditingPostData(null);
  };

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

  const handleEditPost = (postId) => {
    const postToEdit = posts.find((post) => post.id === postId);
    if (postToEdit) {
      setEditingPostData(postToEdit);
      setIsModalOpen(true);
    }
  };

  const handleDeletePost = (postId) => {
    const updatedPosts = posts.filter((post) => post.id !== postId);
    setPosts(updatedPosts);
    savePostsToLocalStorage(updatedPosts);
  };

  const getStartMinutes = (timingStr) => {
    if (!timingStr) return 9999;
    const match = timingStr.match(/(\d{1,2}):(\d{2}) (AM|PM)/i);
    if (!match) return 9999;

    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  const handleSaveLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const mapCoords = convertToDMS(lat, lng);
          const updatedUser = { ...user, location: mapCoords };
          setUser(updatedUser);

          const users = JSON.parse(localStorage.getItem("users")) || {};
          users[user.username] = updatedUser;
          localStorage.setItem("users", JSON.stringify(users));

          alert("Location saved!");
        },
        () => alert("Unable to access your location.")
      );
    } else {
      alert("Geolocation not supported.");
    }
  };

  const handleViewLocation = () => {
    if (user.location) {
      const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${user.location}`;
      window.open(mapUrl, "_blank");
    } else {
      alert("No saved location found.");
    }
  };

  return (
    <div className="user-container">
      {/* DROPDOWN MENU */}
      <div className="dropdown-menu-container">
        <button className="dropdown-toggle" onClick={() => setShowDropdown(!showDropdown)}>
          <Menu size={20} />
        </button>
        {showDropdown && (
          <div className="dropdown-content">
            <div className="dropdown-border" onClick={() => { navigate(`/profile/${user.username}`); setShowDropdown(false); }}><House /></div>
            <div className="dropdown-border" onClick={() => { navigate(`/settings/${encodeURIComponent(user.username)}`); setShowDropdown(false); }}><Settings /></div>
            <div className="dropdown-border" onClick={() => { navigate("/"); setShowDropdown(false); }}><LogOut /></div>
          </div>
        )}
      </div>

      {/* QR CODE VIEW */}
      {showQR && (
        <div className="qr-popup-overlay" onClick={() => setShowQR(false)}>
          <div className="qr-popup-box" onClick={(e) => e.stopPropagation()}>
            <div id="qr-code-to-print" style={{ padding: '10px' }}>
              <QRCodeCanvas
                value={`${window.location.origin}/customerprofile/${user.username}`}
                size={180}
              />
              <p style={{ marginTop: "10px", fontWeight: "bold" }}>
                {user.username}'s QR Code
              </p>
              <div className="qr-btn">
                <button className="qrcancel-btn" onClick={() => setShowQR(false)}>Cancel</button>
                <button
                  className="qrshare-btn"
                  onClick={async () => {
                    const canvas = document.querySelector("#qr-code-to-print canvas");
                    if (!canvas) return alert("QR code not found.");

                    // Convert canvas to blob
                    canvas.toBlob(async (blob) => {
                      if (!blob) return alert("Failed to generate QR code image.");
                      const file = new File([blob], `${user.username}-qrcode.png`, { type: blob.type });

                      if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        try {
                          await navigator.share({
                            title: `${user.username}'s Menu QR`,
                            text: `Scan this QR to view ${user.username}'s menu`,
                            files: [file],
                          });
                        } catch (error) {
                          console.error("Sharing failed", error);
                        }
                      } else {
                        // Fallback: Download the QR code image
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = `${user.username}-qrcode.png`;
                        link.click();
                        URL.revokeObjectURL(url);
                        alert("QR code downloaded (sharing not supported).");
                      }
                    });
                  }}
                >
                  Share
                </button>
                <button className="qrsave-btn" onClick={() => {
                  const printContents = document.getElementById("qr-code-to-print").innerHTML;
                  const printWindow = window.open('', '', 'height=500,width=500');
                  printWindow.document.write('<html><head><title>Print QR Code</title></head><body>');
                  printWindow.document.write(printContents);
                  printWindow.document.write('</body></html>');
                  printWindow.document.close();
                  printWindow.print();
                }}>Print</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BACKGROUND IMAGE */}
      <img src={user.background || "https://placehold.co/600x300"} alt="Background" className="user-background" />

      <div className="profile-container">
        <img src={user.profile || "https://placehold.co/120x120"} alt="Profile" className="user-profile" />
      </div>

      <div className="user-info">
        <h1 className="user-name">{user.username || "Profile Name"}</h1>
        <p className="user-availability">{user.availability || "10:00 AM - 12:00 PM"}</p>
        <div className="locater">
          <button className="qrcodedesign" onClick={() => setShowQR(!showQR)}><ScanQrCode size={20} /></button>
          <button onClick={handleViewLocation} className="location-button" title="View Direction"><LocateFixed size={20} /></button>
          <button className="view-location-btn" onClick={handleSaveLocation} title="Save Current Location"><MapPinPlus size={20} /></button>
        </div>
      </div>

      {/* MENU SECTION */}
      <div className="button-container">
        <div className="m1"><h1> MENU </h1></div>
        <button className="add-post-button" onClick={() => { setEditingPostData(null); setIsModalOpen(true); }}>
          Add Post Item +
        </button>
      </div>

      {/* SEARCH FIELD */}
      <div className="search-container">
        <input
          type="text"
          className="post-search"
          placeholder="Search by post name or timing..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* POSTS LIST */}
      {[...posts]
        .filter((post) =>
          (post.name && post.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (post.timing && post.timing.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .sort((a, b) => getStartMinutes(a.timing) - getStartMinutes(b.timing))
        .map((post) => (
          <div key={post.id} className="post-post">
            <img src={post.image} alt={post.name} className="post-image" />
            <div className="post-details">
              <div className="post-header">
                <input type="text" value={post.name} className="post-name" readOnly />
                <input type="text" value={`Rs:${post.price}`} className="post-price" readOnly />
                {post.timing && <input type="text" value={post.timing} className="post-timing" readOnly />}
              </div>
              <div className="post-actions">
                <button className="edit-button" onClick={() => handleEditPost(post.id)}>✏️</button>
                <button className="delete-button" onClick={() => handleDeletePost(post.id)}>🗑️</button>
              </div>
            </div>
          </div>
        ))}

      {/* MODAL */}
      <AddPostModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingPostData(null); }}
        onAddPost={handleAddPost}
        editingPost={editingPostData}
      />
    </div>
  );
};

export default UserProfile;
