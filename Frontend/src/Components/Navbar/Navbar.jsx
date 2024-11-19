import React, { useState, useEffect } from 'react';
import './Navbar.css';
import logo from '../Assets/logo.png';
import { useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  // Function to fetch cart count based on the new cart format
  const getCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || {};
    return Object.values(cart).reduce((total, quantity) => total + (quantity || 0), 0);
  };

  useEffect(() => {
    const updateCartCount = () => setCartCount(getCartCount());

    // Listen for cart updates
    window.addEventListener('cartUpdated', updateCartCount);

    // Update on initial render
    updateCartCount();

    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);

  useEffect(() => {
    const checkLoginStatus = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
    };

    // Polling to check token status every second
    const interval = setInterval(checkLoginStatus, 1000);

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const toggleSlider = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    // Remove token and cart data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('cart');

    // Update state to reflect logout
    setIsLoggedIn(false);
    setCartCount(0); // Reset cart count to zero

    // Dispatch cartUpdated event to update any components relying on cart
    window.dispatchEvent(new Event('cartUpdated'));

    // Navigate to home or login page after logout
    navigate('/');
  };

  const handleCategoryClick = (path) => {
    if (path === '/profile' && !isLoggedIn) {
      // Redirect to login if the user is not logged in and clicked on Profile
      navigate('/login');
    } else {
      // Otherwise, navigate to the specified path
      navigate(path);
    }
    setIsOpen(false); // Close the slider when navigating
  };

  const handleCartClick = () => {
    if (isLoggedIn) {
      navigate('/cart'); // Navigate to the cart if logged in
    } else {
      navigate('/login'); // Navigate to login if not logged in
    }
  };

  return (
    <div className="navbar">
      <div className="nav-logo">
        <img
          className="log"
          src={logo}
          alt="Logo"
          onClick={() => handleCategoryClick('/')}
          style={{ cursor: 'pointer' }}
        />
        <i
          className="fa-solid fa-bars nav-hamburger"
          onClick={toggleSlider}
          style={{ cursor: 'pointer' }}
        ></i>
      </div>

      {/* Slider Menu */}
      <div className={`nav-slider ${isOpen ? 'open' : ''}`}>
        <div className="close-btn" onClick={toggleSlider}>×</div>
        <div
          className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
          onClick={() => handleCategoryClick('/')}
        >
          Home
        </div>
        <div
          className={`nav-item ${location.pathname === '/menu' ? 'active' : ''}`}
          onClick={() => handleCategoryClick('/menu')}
        >
          Menu
        </div>
        <div
          className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
          onClick={() => handleCategoryClick('/profile')}
        >
          Profile
        </div>
        <div
          className={`nav-item ${location.pathname === '/about-us' ? 'active' : ''}`}
          onClick={() => handleCategoryClick('/about-us')}
        >
          About Us
        </div>
        <div
          className={`nav-item ${location.pathname === '/contact' ? 'active' : ''}`}
          onClick={() => handleCategoryClick('/contact')}
        >
          Contact Us
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="nav-links">
        <div
          className={`hme ${location.pathname === '/' ? 'active' : ''}`}
          onClick={() => handleCategoryClick('/')}
        >
          Home
        </div>
        <div
          className={`mnu ${location.pathname === '/menu' ? 'active' : ''}`}
          onClick={() => handleCategoryClick('/menu')}
        >
          Menu
        </div>
      </div>

      {/* Cart and Login/Logout */}
      <div className="nav-login-cart">
        {isLoggedIn ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <button onClick={() => handleCategoryClick('/login')}>Login</button>
        )}

        <div
          onClick={handleCartClick}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <i className="fa-solid fa-cart-shopping"></i>
          <div className="nav-cart-count">{cartCount}</div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
