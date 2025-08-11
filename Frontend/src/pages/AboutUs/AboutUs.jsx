import React from 'react'
import './AboutUs.css'


const AboutUs = () => {
  return (
    <div className='about-us' id='about-us'>
      <div className="about-us-content">
        <h1>About Viet Bowls</h1>
        <p className="about-subtitle">
          Bringing authentic Vietnamese flavors to your table since 2020
        </p>
        
        <div className="about-story">
          <h2>Our Story</h2>
          <p>
            Founded with a passion for authentic Vietnamese cuisine, Viet Bowls began as a small family restaurant
            with a big dream - to share the rich flavors and traditions of Vietnam with our community.
          </p>
          <p>
            What started as a humble kitchen serving traditional pho and banh mi has grown into a beloved
            destination for food lovers seeking authentic Vietnamese flavors. Our recipes have been passed down
            through generations, preserving the authentic taste of Vietnam.
          </p>
        </div>

        <div className="about-mission">
          <h2>Our Mission</h2>
          <p>
            At Viet Bowls, we believe that food is more than just sustenance - it's a way to connect with
            culture, tradition, and community. Our mission is to bring the authentic flavors of Vietnam to
            your doorstep, making it easy for everyone to experience the rich culinary heritage of this
            beautiful country.
          </p>
        </div>

        <div className="about-values">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-item">
              <h3>Authenticity</h3>
              <p>We stay true to traditional Vietnamese recipes and cooking methods.</p>
            </div>
            <div className="value-item">
              <h3>Quality</h3>
              <p>We use only the freshest ingredients and maintain the highest standards.</p>
            </div>
            <div className="value-item">
              <h3>Community</h3>
              <p>We're committed to serving and supporting our local community.</p>
            </div>
          </div>
        </div>
      </div>
      {/* Floating Cart Button is now handled globally in App.jsx */}
    </div>
  )
}

export default AboutUs 