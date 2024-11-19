import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

export const Profile = () => {
  const [userData, setUserData] = useState({ name: '', email: '', address: '' });
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', password: '', address: '' });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found.');
        return;
      }
  
      try {
        const response = await axios.get('http://localhost:4000/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        console.log('Fetched user data:', response.data);  // Log response data
  
        if (response.data) {
          setUserData({
            name: response.data.name,
            email: response.data.email,
            address: response.data.address,
          });
          setFormData({
            name: response.data.name,
            password: '',
            address: response.data.address,
          });
        }
      } catch (error) {
        setError('Failed to fetch user data.');
      }
    };
  
    fetchUserData();
  }, []);
  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No token found.');
      return;
    }

    if (formData.name === userData.name && formData.address === userData.address && !formData.password) {
      return;
    }

    const updatedData = {
      name: formData.name,
      address: formData.address,
      password: formData.password || undefined,
    };

    try {
      const response = await axios.post(
        'http://localhost:4000/profile/update',
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setUserData({ ...userData, name: formData.name, address: formData.address });
        setEditMode(false);
        setSuccessMessage('Profile updated successfully!');
        setFormData({ name: formData.name, password: '', address: formData.address });
      } else {
        setError('Failed to update profile.');
      }
    } catch (error) {
      setError('Error updating profile.');
    }
  };

  return (
    <div className="profile-container">
      <h1>User Profile</h1>

      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSaveChanges}>
        <label>Name:</label>
        {editMode ? (
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        ) : (
          <p>{userData.name}</p>
        )}

        <label>Email:</label>
        <p>{userData.email}</p>

        <label>Address:</label>
        {editMode ? (
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        ) : (
          <p>{userData.address}</p>
        )}

        {editMode && (
          <>
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter new password (optional)"
            />
          </>
        )}

        {editMode ? (
          <button type="submit" className="save-btn">Save Changes</button>
        ) : (
          <button
            type="button"
            className="edit-btn"
            onClick={() => setEditMode(true)}
          >
            Edit Profile
          </button>
        )}
      </form>
    </div>
  );
};

export default Profile;
