import React, { useState, useEffect } from 'react';
import './Login.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const [signInMode, setSignInMode] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const toggleMode = () => {
    setError(''); // Clear error when switching modes
    setSignInMode(!signInMode);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Sign-Up Handler
  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields are required for signup.');
      return;
    }

    try {
      await axios.post('http://localhost:4000/signup', formData);
      alert('Registration successful!');
      setSignInMode(true); // Switch to sign-in mode after successful registration
      setFormData({ name: '', email: '', password: '' }); // Clear form data
    } catch (error) {
      console.error('Sign-Up Error:', error.response || error.message);
      setError(error.response?.data?.errors || 'Error registering user');
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
  
    const { email, password } = formData;
  
    try {
      const response = await axios.post('http://localhost:4000/login', { email, password });
  
      if (response.data.success) {
        const token = response.data.token;
        localStorage.setItem('token', token);
  
        // Sync local cart with backend
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        if (localCart.length > 0) {
          await axios.post(
            'http://localhost:4000/update-cart',
            { cartData: localCart },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
  
        // Fetch updated cart from backend
        const cartResponse = await axios.get('http://localhost:4000/cart', {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        if (cartResponse.data.cartData) {
          localStorage.setItem('cart', JSON.stringify(cartResponse.data.cartData));
        }
  
        navigate('/'); // Redirect after successful login
      } else {
        // If `success` is false, display the error message from the backend
        setError(response.data.errors || 'Login failed. Please try again.');
      }
    } catch (error) {
      // Handle errors returned by the backend
      if (error.response && error.response.data && error.response.data.errors) {
        setError(error.response.data.errors); // Show backend error in the frontend
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  // Fetch cart data on page load
  useEffect(() => {
    const fetchCartData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:4000/cart', {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data.cartData) {
            localStorage.setItem('cart', JSON.stringify(response.data.cartData));
          }
        } catch (error) {
          console.error('Error fetching cart data:', error.response || error.message);
        }
      }
    };

    fetchCartData();
  }, []);

  return (
    <div className='hm2'>
      <div className={`container ${signInMode ? '' : 'right-panel-active'}`}>
        {/* Sign-Up Container */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleSignUp}>
            <h1>Create Account</h1>
            <input
              type="text"
              placeholder="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button type="submit">Sign Up</button>
            {error && <div className="error">{error}</div>}
          </form>
        </div>

        {/* Sign-In Container */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleSignIn}>
            <h1>Sign In</h1>
            <input
              type="email"
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button type="submit">Sign In</button>
            {error && <div className="error">{error}</div>}
          </form>
        </div>

        {/* Overlay */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p className='te'>To keep connected with us, please log in with your personal info</p>
              <button className="ghost" onClick={toggleMode}>Sign In</button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Hello, Friend!</h1>
              <p className='te'>Enter your personal details and start your journey with us</p>
              <button className="ghost" onClick={toggleMode}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
