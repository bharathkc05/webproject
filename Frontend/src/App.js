import React from 'react';
import Navbar from './Components/Navbar/Navbar';
import Footer from './Components/Footer/Footer';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Menu from './Pages/Menu'; // Import Menu correctly
import { Login } from './Pages/Login';
import Cart from './Pages/Cart';
import Home from './Pages/Home';
import ContactUs from './Pages/ContactUs';
import './App.css';
import Profile from './Pages/profile';
import AboutUs from './Pages/AboutUs';

function App() {
  return (
    <BrowserRouter> {/* BrowserRouter now wraps the entire app */}
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/menu/Veg" element={<Menu category="Veg" />} />
          <Route path="/menu/Non-Veg" element={<Menu category="Non-Veg" />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path='/profile' element={<Profile/>}/>
          <Route path='/about-us' element={<AboutUs/>}/>
          <Route path="/contact" element={<ContactUs />} />
        </Routes>
        <Footer class="footer" />
    </BrowserRouter>
  );
}

export default App;
