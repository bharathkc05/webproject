import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import products from '../../Data/products';
import './Recommend.css'; // Ensure you have the CSS file for styling

export const Recommend = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || {}); // Cart state
  const [loadingItem, setLoadingItem] = useState(null); // Loading state for "Add to Cart"
  const [error, setError] = useState(null); // Error state
  const [successMessage, setSuccessMessage] = useState(null); // Success message state

  // Select specific products by their name
  const recommendedProducts = products.filter(product =>
    [
      "Crispy Chicken Burger",
      "Crispy Veg Burger",
      "Paneer Royale Burger",
      "Fiery Chicken Burger",
      "Chicken Tandoori Burger",
      "Hot and Saucy Burger"
    ].includes(product.name)
  );

  // Update backend cart
  const updateBackendCart = async (cartData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("User is not authenticated. Please log in.");
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/update-cart', { cartData }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setError(null);
        // Dispatch cartUpdated event to notify other components
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        setError('Failed to update cart on backend.');
        setSuccessMessage(null);
      }
    } catch (error) {
      setError('Error updating cart.');
      setSuccessMessage(null);
      console.error('Error updating cart on backend:', error);
    }
  };

  const addToCart = async (e, product) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please log in to add items to the cart.");
      navigate('/login');
      return;
    }

    setLoadingItem(product.id);

    // Update cart in local storage
    let currentCart = { ...cart };
    currentCart[product.id] = (currentCart[product.id] || 0) + 1;
    setCart(currentCart);

    // Save updated cart to local storage
    localStorage.setItem('cart', JSON.stringify(currentCart));

    // Prepare cartData with productId as keys and quantities as numbers
    const cartData = Object.keys(currentCart).reduce((acc, productId) => {
      acc[productId] = Number(currentCart[productId]);
      return acc;
    }, {});

    // Update backend with the formatted cart data
    await updateBackendCart(cartData);
    setLoadingItem(null);
  };

  return (
    <div className="recommend-container">
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {recommendedProducts.map((product) => (
            <div className="product-card fadeIn" key={product.id}>
              <div className="productcard">
                <div className="image">
                  <img src={product.imageUrl} alt={product.name} className="product-image" />
                </div>
                <div
                  className="product-name"
                  style={{ color: product.isVeg ? 'green' : 'red' }}
                >
                  {product.name}
                </div>
                <h3 className="product-description">{product.description}</h3>
                <p className="price">{product.price.toFixed(2)}</p>
                <button
                  className="add-to-cart"
                  onClick={(e) => addToCart(e, product)}
                  disabled={loadingItem === product.id}
                >
                  {loadingItem === product.id ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
    </div>
  );
};

export default Recommend;
