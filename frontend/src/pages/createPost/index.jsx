import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { FaImage, FaTag, FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import "./styles.scss";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CreatePost = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(""); // NEW
  const fileInputRef = useRef(null);

  // Handle image selection and preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File size must be less than 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageFile(event.target.result);
      setPreviewImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle post creation
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      alert("Please fill in the title and description.");
      return;
    }
    setLoading(true);
    setSuccessMsg(""); // Clear previous success
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/api/createPost`,
        {
          title,
          description,
          imageFile, // can be null
          tags: tags.split(",").map(tag => tag.trim()).filter(tag => tag !== "")
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (response.data.success) {
        setSuccessMsg("Post created successfully!");
        setTimeout(() => {
          navigate("/profile/" + (response.data.data[0]?.username || ""));
        }, 1800);
      } else {
        alert("Failed to create post.");
      }
    } catch (error) {
      alert("Error creating post. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-page">
      <Header />
      <div className="create-post-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <h2>Create a New Post</h2>
        {successMsg && (
          <div className="success-message">
            <FaCheckCircle className="success-icon" />
            {successMsg}
          </div>
        )}
        <form className="create-post-form" onSubmit={handleCreatePost}>
          <div className="form-group">
            <label>Title*</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter post title"
              required
            />
          </div>
          <div className="form-group">
            <label>Description*</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Write your post description..."
              rows={4}
              required
            />
          </div>
          <div className="form-group">
            <label>
              <FaTag /> Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="e.g. workout, fitness, gym"
            />
          </div>
          <div className="form-group">
            <label>
              <FaImage /> Image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            {previewImage && (
              <img
                src={previewImage}
                alt="Preview"
                className="preview-image"
                style={{ marginTop: "10px", borderRadius: "8px", maxWidth: "100%" }}
              />
            )}
          </div>
          <div className="form-actions">
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? "Posting..." : "Create Post"}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default CreatePost;
