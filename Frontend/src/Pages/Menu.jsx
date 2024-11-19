import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import products from '../Data/products';
import './Menu.css';

export const Menu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || {});
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loadingItem, setLoadingItem] = useState(null);

  useEffect(() => {
    const path = location.pathname;
    const category = path.split('/')[2] || "All";
    setSelectedCategory(category);
  }, [location]);

  useEffect(() => {
    const filtered = products.filter(
      product =>
        selectedCategory === "All" ||
        (selectedCategory === "Veg" && product.isVeg) ||
        (selectedCategory === "Non-Veg" && !product.isVeg)
    );
    setFilteredProducts(filtered);
  }, [selectedCategory]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    navigate(`/menu/${category === 'All' ? '' : category}`);
  };

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
    <div className="home">
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="category-selection">
        {["All", "Veg", "Non-Veg"].map(category => (
          <div
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`category-item ${selectedCategory === category ? "active" : ""}`}
          >
            {category}
          </div>
        ))}
      </div>

      <div className="product-display">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
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
          ))
        ) : (
          <p>No products available in this category.</p>
        )}
      </div>
    </div>
  );
};

export default Menu;
