import React from 'react'
import Hero from '../Components/Hero/Hero'
import './Home.css'
import Recommend from '../Components/Recommended/Recommend'

export const Home = () => {
  return (
    <div className='hm'>
        <Hero/>
        <h2 className="recomend">Velvet Bites Recommended</h2>
        <Recommend/>
    </div>
  )
}

export default Home