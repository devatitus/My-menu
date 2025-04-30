import React, { useState, useEffect } from "react";
import "../styles/AddPostModal.css";
import logo from "../assets/logo.webp";

const AddPostModal = ({ isOpen, onClose, onAddPost, editingPost }) => {
  const [postName, setPostName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [customTimeName, setCustomTimeName] = useState("");
  const [customStartTime, setCustomStartTime] = useState("06:00");
  const [customEndTime, setCustomEndTime] = useState("12:00");

  useEffect(() => {
    if (isOpen) {
      if (editingPost && typeof editingPost === "object") {
        setPostName(editingPost.name || "");
        setPrice(editingPost.price || "");
        setImage(editingPost.image || null);

        if (editingPost.customTimeName) {
          setUseCustomTime(true);
          setCustomTimeName(editingPost.customTimeName || "");
          setCustomStartTime(editingPost.customStartTime || "06:00");
          setCustomEndTime(editingPost.customEndTime || "12:00");
        } else {
          setUseCustomTime(false);
        }
      } else {
        // Reset form
        setPostName("");
        setPrice("");
        setImage(null);
        setUseCustomTime(false);
        setCustomTimeName("");
        setCustomStartTime("06:00");
        setCustomEndTime("12:00");
      }
    }
  }, [editingPost, isOpen]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertTo12HourFormat = (time) => {
    let [hours, minutes] = time.split(":");
    let period = "AM";
    hours = parseInt(hours);
    if (hours >= 12) {
      period = "PM";
      if (hours > 12) hours -= 12;
    } else if (hours === 0) {
      hours = 12;
    }
    return `${hours}:${minutes} ${period}`;
  };

  const handleSavePost = () => {
    if (!postName || !price || !image) {
      alert("Please enter all details");
      return;
    }

    const postData = {
      name: postName,
      price: price,
      image: image,
    };

    if (useCustomTime) {
      const formattedStartTime = convertTo12HourFormat(customStartTime);
      const formattedEndTime = convertTo12HourFormat(customEndTime);

      postData.timing = `${customTimeName} (${formattedStartTime} - ${formattedEndTime})`;
      postData.customTimeName = customTimeName;
      postData.customStartTime = customStartTime;
      postData.customEndTime = customEndTime;
    }

    onAddPost(postData);
    onClose();
  };

  return isOpen ? (
    <div className="modal-overlay">
      <div className="modal-content">
        <img src={logo} alt="My Menu Logo" className="logo" />
        <h2>{editingPost ? "Edit Item" : "Add Item"}</h2>

        <div className="input-group">
          <input
            type="text"
            placeholder="Item Name"
            value={postName}
            onChange={(e) => setPostName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div className="image-uploads">
          <label className="image-box">
            {image ? (
              <img src={image} alt="Preview" className="preview-images" />
            ) : (
              <span>+</span>
            )}
            <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
          </label>
        </div>

        <div className="timing-section">
          <label>
            <input
              type="checkbox"
              checked={useCustomTime}
              onChange={(e) => setUseCustomTime(e.target.checked)}
            />
            Add Custom Timing
          </label>

          {useCustomTime && (
            <div className="custom-time">
              <input
                type="text"
                placeholder="Timing Name (e.g., Evening Sale)"
                value={customTimeName}
                onChange={(e) => setCustomTimeName(e.target.value)}
              />
              <input
                type="time"
                value={customStartTime}
                onChange={(e) => setCustomStartTime(e.target.value)}
              />
              <span>to</span>
              <input
                type="time"
                value={customEndTime}
                onChange={(e) => setCustomEndTime(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="modal-buttons">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="save-btn" onClick={handleSavePost}>
            {editingPost ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default AddPostModal;
