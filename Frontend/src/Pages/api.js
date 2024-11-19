// src/api/auth.js
import axios from 'axios';

export const handleLogin = async (username, password) => {
  try {
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      email: username,
      password: password,
    });

    return response.data; // This should contain token or user information
  } catch (error) {
    console.error('Error during login:', error.response?.data || error.message);
    throw error.response?.data || new Error('Login failed');
  }
};
