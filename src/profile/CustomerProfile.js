import React, { useState, useEffect } from "react";
import "../styles/UserProfile.css";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { LocateFixed, MapPinPlus, ScanQrCode } from "lucide-react";

const CustomerProfile = () => {
    const [posts, setPosts] = useState([]);
    const [user, setUser] = useState({});
    const [showQR, setShowQR] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const { username } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (!username) {
            navigate("/");
            return;
        }

        const localUsers = localStorage.getItem("users");
        if (localUsers) {
            try {
                const parsed = JSON.parse(localUsers);
                const foundUser = parsed[username];
                if (foundUser) {
                    setUser(foundUser);
                    const postData = JSON.parse(localStorage.getItem(`${username}_posts`)) || [];
                    setPosts(postData);
                    return;
                }
            } catch (err) {
                console.error("LocalStorage user fetch failed:", err);
            }
        }

        // fallback to JSON file if user not found in localStorage
        const fetchFromJson = async () => {
            try {
                const response = await fetch("/users.json");
                const data = await response.json();
                const found = data.find((user) => user.username === username);
                if (found) {
                    setUser(found);
                    const postData = JSON.parse(localStorage.getItem(`${username}_posts`)) || [];
                    setPosts(postData);
                } else {
                    alert("User not found.");
                    navigate("/");
                }
            } catch (error) {
                console.error("Fetch failed:", error);
                alert("Something went wrong.");
                navigate("/");
            }
        };

        fetchFromJson();
    }, [username, navigate]);

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

    return (
        <div className="user-container">
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
                            </div>
                        </div>
                    </div>
                </div>
            )}

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

            <div className="button-container">
                <div className="m1"><h1> MENU </h1></div>
            </div>

            <div className="search-container">
                <input
                    type="text"
                    className="post-search"
                    placeholder="Search by post name or timing..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {[...posts]
                .filter((post) =>
                    (post.name && post.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (post.timing && post.timing.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .sort((a, b) => getStartMinutes(a.timing) - getStartMinutes(b.timing))
                .map((post, index) => (
                    <div key={post.id || post.name + index} className="post-post">
                        <img src={post.image} alt={post.name} className="post-image" />
                        <div className="post-details">
                            <div className="post-header">
                                <input type="text" value={post.name} className="post-name" readOnly />
                                <input type="text" value={`Rs:${post.price || "-"}`} className="post-price" readOnly />
                                {post.timing && <input type="text" value={post.timing} className="post-timing" readOnly />}
                            </div>
                        </div>
                    </div>
                ))}
        </div>
    );
};

export default CustomerProfile;
