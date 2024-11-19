// src/Pages/ContactUs.js
import React, { useState } from 'react';
import './ContactUs.css'; // Create your CSS file for styling

const ContactUs = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [formStatus, setFormStatus] = useState('');

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !email || !message) {
      setFormStatus('Please fill in all fields.');
      return;
    }

    // Simulate sending the form data (you would integrate with an API here)
    setFormStatus('Thank you for contacting us! We will get back to you soon.');

    // Clear form after submission
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="contact-us-container">
      <h1>Contact Us</h1>
      <form onSubmit={handleSubmit} className="contact-form">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          ></textarea>
        </div>
        <button type="submit">Submit</button>
      </form>

      {formStatus && <p className="form-status">{formStatus}</p>}
    </div>
  );
};

export default ContactUs;
