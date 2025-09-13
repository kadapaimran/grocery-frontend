import '../components/style.css';
import { Link } from "react-router-dom";
import "../styles/About.css"

const AboutUs = () => {
  return (
    <div className="about-container">
      <h2>Apex Smart</h2>
      <p>
        Welcome to <strong>Apex Smart</strong>, your premier destination for intelligent grocery shopping! 
        We revolutionize the way you shop with cutting-edge technology, premium quality products, 
        and seamless delivery services. From farm-fresh organic produce to everyday essentials, 
        were committed to bringing you the smartest grocery experience.
      </p>

      {/* Store Statistics */}

      {/* Mission Statement */}
      <div className="mission-statement">
        <h3>Our Smart Mission</h3>
        <p>
          At Apex Smart, we believe grocery shopping should be effortless, efficient, and enjoyable. 
          Our advanced AI-powered recommendation system, real-time inventory tracking, and 
          sustainable sourcing practices ensure you get the best products at the right time, 
          every time. We are not just a grocery store – we are your smart shopping partner.
        </p>
      </div>

      <div className="about-grid">
        <Link to="/categories/fruits">
          <div className="about-item">
            <img src="https://th.bing.com/th/id/OIP.GXrVwi1Jr0NolWx9iPBuoQHaEK?w=349&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3" alt="Fruits & Vegetables" />
            <h3>Fresh Fruits & Vegetables</h3>
            <p>Premium organic produce sourced directly from certified local farms. Smart freshness indicators and AI-powered ripeness detection ensure peak quality.</p>
          </div>
        </Link>

        <Link to="/categories/dairy">
          <div className="about-item">
            <img src="https://th.bing.com/th/id/OIP.VklWBnsByaQeQVxlxtaFHgHaE8?w=298&h=199&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3" alt="Dairy & Eggs" />
            <h3>Smart Dairy & Eggs</h3>
            <p>Temperature-controlled dairy products with smart expiry tracking. Fresh milk, artisanal cheese, probiotics, and farm-fresh eggs with traceability codes.</p>
          </div>
        </Link>

        <Link to="/categories/pantry">
          <div className="about-item">
            <img src="https://th.bing.com/th/id/OIP.F7wD-xfUaxvqU_8_VoJvoAHaHa?w=197&h=197&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3" alt="Pantry Essentials" />
            <h3>Intelligent Pantry</h3>
            <p>Smart pantry management with auto-replenishment suggestions. Premium grains, exotic spices, cooking oils, and essentials with smart storage tips.</p>
          </div>
        </Link>

        <Link to="/categories/snacks">
          <div className="about-item">
            <img src="https://th.bing.com/th/id/OIP.a0l6-QWgGIK-Lx3hei624wHaGL?w=226&h=189&c=7&r=0&o=5&dpr=1.3&pid=1.7" alt="Snacks & Beverages" />
            <h3>Smart Snacks & Drinks</h3>
            <p>Curated healthy snacks, organic beverages, and refreshing drinks. Personalized recommendations based on your taste preferences and dietary needs.</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AboutUs;