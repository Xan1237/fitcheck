import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaSearch, FaUser } from "react-icons/fa";
import Header from "../../components/header";
import "./styles.scss";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const People = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/getAllUsers`);
        setUsers(response.data || []);
      } catch (error) {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter users by search
  const filteredUsers = users.filter(
    user =>
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <Header />
      <div className="people-page">
        <div className="people-header">
          <h1>
            <FaUser /> People
          </h1>
          <div className="people-search-bar">
            <FaSearch />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="people-list">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="no-users">No users found.</div>
          ) : (
            filteredUsers.map(user => (
              <Link
                key={user.username}
                to={`/profile/${user.username}`}
                className="people-list-item"
              >
                <FaUser className="user-icon" />
                <span className="user-name">{user.name || user.username}</span>
                <span className="user-username">@{user.username}</span>
              </Link>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default People;
