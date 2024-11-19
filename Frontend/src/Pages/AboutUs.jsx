import React from 'react';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <div className="about-us-container">
      <h1>About Us</h1>

      {/* Mission Statement */}
      <section className="mission-statement">
        <h2>Our Mission</h2>
        <p>
          We aim to deliver the best products and services to our customers, fostering an environment
          of innovation, integrity, and community. Our goal is to make a positive impact through 
          our work, enhancing lives and driving progress.
        </p>
      </section>

      {/* Company History */}
      <section className="company-history">
        <h2>Our History</h2>
        <p>
          Founded in 2010, our company began as a small start-up with a vision to change the industry. 
          Over the years, we have grown into a leading provider in our field, dedicated to serving our 
          clients with high-quality products and exceptional service. We are proud of our journey and 
          excited about the future ahead.
        </p>
      </section>

      {/* Team */}
      <section className="our-team">
        <h2>Meet Our Team</h2>
        <p>
          Our team is composed of dedicated professionals from diverse backgrounds, each bringing 
          unique expertise and perspectives. Together, we are committed to achieving excellence and 
          pushing the boundaries of what’s possible.
        </p>
      </section>

      {/* Vision */}
      <section className="our-vision">
        <h2>Our Vision</h2>
        <p>
          Looking forward, we envision a world where technology and innovation enhance human potential 
          and quality of life. We believe in the power of collaboration, sustainability, and constant 
          improvement to shape a brighter future.
        </p>
      </section>

      {/* Call to Action */}
      <section className="call-to-action">
        <h2>Get Involved</h2>
        <p>
          Join us on our journey! Whether you’re a customer, partner, or job seeker, there are many ways 
          to get involved and help us shape the future. Reach out to us to learn more about opportunities 
          to collaborate.
        </p>
        <button onClick={() => window.location.href = '/contact'}>Contact Us</button>
      </section>
    </div>
  );
};

export default AboutUs;
