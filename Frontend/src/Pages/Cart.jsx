import React, { useState, useEffect } from 'react';
import axios from 'axios';
import products from '../Data/products';
import './Cart.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loadingItem, setLoadingItem] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [address, setAddress] = useState('');
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Load cart data from local storage and backend
  const loadCart = async () => {
    const token = localStorage.getItem('token');
    let backendCartData = {};

    if (token) {
      try {
        const cartResponse = await axios.get('http://localhost:4000/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (cartResponse.data.success) {
          backendCartData = cartResponse.data.cartData;
        } else {
          setError('Failed to load cart from backend.');
        }
      } catch (error) {
        setError('Error fetching cart data from backend.');
        console.error('Error fetching cart:', error);
      }
    }

    const storedCart = JSON.parse(localStorage.getItem('cart')) || {};
    const combinedCartData = { ...backendCartData, ...storedCart };

    const items = Object.entries(combinedCartData)
      .map(([productId, quantity]) => {
        const product = products.find(p => p.id === parseInt(productId));
        return product && quantity > 0 ? { ...product, quantity: Number(quantity) } : null;
      })
      .filter(item => item);

    setCartItems(items);
  };

  // Update backend cart with the latest data
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
        setSuccessMessage('Cart updated successfully!');
        window.dispatchEvent(new Event('cartUpdated')); // Notify other components
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

  // Handle item quantity increase or decrease
  const handleQuantityChange = async (productId, type) => {
    setLoadingItem(productId);

    let currentCart = { ...JSON.parse(localStorage.getItem('cart')) };

    if (type === 'increase') {
      currentCart[productId] = (currentCart[productId] || 0) + 1;
    } else if (type === 'decrease' && currentCart[productId] > 1) {
      currentCart[productId] -= 1;
    } else {
      setLoadingItem(null);
      return; // Prevent decreasing below 1
    }

    // Update local cart state
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === productId ? { ...item, quantity: currentCart[productId] } : item
      )
    );

    // Save the updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(currentCart));

    // Prepare the cart data for the backend
    const cartData = Object.keys(currentCart).reduce((acc, productId) => {
      acc[productId] = Number(currentCart[productId]);
      return acc;
    }, {});

    // Update backend with the new cart data
    await updateBackendCart(cartData);
    setLoadingItem(null);
  };

  // Handle item removal from cart (set quantity to 0)
  const handleRemoveItem = async (productId) => {
    setLoadingItem(productId);

    // Remove item from local storage by setting its quantity to 0
    const currentCart = { ...JSON.parse(localStorage.getItem('cart')) };
    currentCart[productId] = 0; // Set the quantity to 0
    localStorage.setItem('cart', JSON.stringify(currentCart));

    // Remove item from the cartItems state (to remove it from UI)
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));

    // Prepare the cart data for the backend with 0 quantity for the removed item
    const cartData = Object.keys(currentCart).reduce((acc, productId) => {
      acc[productId] = Number(currentCart[productId]);
      return acc;
    }, {});

    // Update backend with the new cart data
    await updateBackendCart(cartData);
    setLoadingItem(null);
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const saveAddress = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post('http://localhost:4000/profile/update', { address }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setIsEditingAddress(false);
        setSuccessMessage('Address saved successfully');
      } else {
        setError('Failed to save address');
      }
    } catch (error) {
      setError('Error saving address.');
      console.error('Error saving address:', error);
    }
  };

  const calculateTotal = () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  return (
    <div className="checkout-container">
      <div className="cart-section">
        <h2>Cart</h2>
        <div className="cart-header">
          <p>Image</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <hr />
        <div className="cart-items-list">
          {cartItems.length > 0 ? (
            cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  <img src={item.imageUrl} alt={item.name} />
                </div>
                <div className="item-title">{item.name}</div>
                <div className="item-price">₹{item.price}</div>
                <div className="item-quantity">
                  <button 
                    onClick={() => handleQuantityChange(item.id, 'decrease')}
                    disabled={loadingItem === item.id || item.quantity <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(item.id, 'increase')}
                    disabled={loadingItem === item.id}
                  >
                    +
                  </button>
                </div>
                <div className="item-total">₹{(item.price * item.quantity).toFixed(2)}</div>
                <button 
                  onClick={() => handleRemoveItem(item.id)} 
                  disabled={loadingItem === item.id}
                >
                  Remove
                </button>
              </div>
            ))
          ) : (
            <p>No items in cart</p>
          )}
        </div>
        <h3>Total: ₹{calculateTotal().toFixed(2)}</h3>
      </div>
  
      <div className="address-section">
        <h2>Delivery/Address Details</h2>
        {isEditingAddress ? (
          <div>
            <input
              type="text"
              value={address}
              onChange={handleAddressChange}
              placeholder="Enter your address"
            />
            <button onClick={saveAddress}>Save Address</button>
          </div>
        ) : (
          <div>
            {address ? (
              <div>
                <p>{address}</p>
                <button onClick={() => setIsEditingAddress(true)}>Edit Address</button>
              </div>
            ) : (
              <div>
                <p>Add your address</p>
                <button onClick={() => setIsEditingAddress(true)}>Add Address</button>
              </div>
            )}
          </div>
        )}
      </div>
  
      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Cart;
