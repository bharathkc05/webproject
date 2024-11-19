import React, { useState, useEffect } from 'react';
import './Hero.css';
import hero1 from '../Assets/hero1.jpg';
import hero2 from '../Assets/hero2.jpg';
import hero3 from '../Assets/hero3.jpg';

const Hero = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const totalSlides = 3;

    const nextSlide = () => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % totalSlides);
    };

    const prevSlide = () => {
        setCurrentSlide((prevSlide) => (prevSlide - 1 + totalSlides) % totalSlides);
    };

    useEffect(() => {
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, []);

    // Assign the image sources based on the current slide
    const slideImages = [
        hero1,
        hero2,
        hero3
    ];

    return (
        <div className="hero">
            <div className="hero-slider">
                {/* Slide 1 */}
                <div className={`slide ${currentSlide === 0 ? "active" : ""}`} style={{ backgroundImage: `url(${slideImages[0]})` }}>
                   
                </div>

                {/* Slide 2 */}
                <div className={`slide ${currentSlide === 1 ? "active" : ""}`} style={{ backgroundImage: `url(${slideImages[1]})` }}>
                    
                </div>

                {/* Slide 3 */}
                <div className={`slide ${currentSlide === 2 ? "active" : ""}`} style={{ backgroundImage: `url(${slideImages[2]})` }}>
                    
                </div>

                <button className="nav-button prev" onClick={prevSlide}><i class="fa-solid fa-chevron-left"></i></button>
                <button className="nav-button next" onClick={nextSlide}><i class="fa-solid fa-chevron-right"></i></button>
            </div>
        </div>
    );
};

export default Hero;
