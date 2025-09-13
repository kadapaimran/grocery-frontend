import { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import { 
  FaUserCircle, 
  FaShoppingCart, 
  FaSearch, 
  FaHeart,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaFacebookF,
  FaTwitter,
  FaInstagram
} from "react-icons/fa";
import "../styles/Home.css";

const HomePage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorageChange);

    // Get username from localStorage (set on login)
    const storedUser = localStorage.getItem("username");
    if (storedUser) setUsername(storedUser);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    setIsAuthenticated(false);
    setDropdownOpen(false);
    navigate("/login", { replace: true });
  };

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".profile-menu")) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="apex-container">
      {/* Header */}
      <header className="header">
        <div className="header-container">
          {/* Logo */}
          <div className="logo-section">
            <Link to="/" className="logo-link">
              <div className="logo">
                <span className="logo-icon">🏪</span>
                <div className="logo-text">
                  <h1>Apex Mart</h1>
                  <span className="tagline">Fresh • Fast • Reliable</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="search-section">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search for groceries, brands, and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">
                <FaSearch />
              </button>
            </form>
          </div>

          {/* Header Actions */}
          <div className="header-actions">
            {isAuthenticated ? (
              <>
                <Link to="/wishlist" className="action-item wishlist">
                  <FaHeart className="action-icon" />
                  <span className="action-text">Wishlist</span>
                </Link>

                <Link to="/cart" className="action-item cart">
                  <FaShoppingCart className="action-icon" />
                  <span className="action-text">Cart</span>
                </Link>

                {/* Profile Menu - Only Icon */}
                <div className="profile-menu">
                  <div className="profile-trigger" onClick={toggleDropdown}>
                    <FaUserCircle className="profile-icon" />
                  </div>
                  {dropdownOpen && (
                    <div className="dropdown">
                      <div className="dropdown-header">
                        <div className="user-info">
                          <FaUserCircle size={32} />
                          <div>
                            <div className="user-name">{username || "Account"}</div>
                          </div>
                        </div>
                      </div>
                      <div className="dropdown-body">
                        <Link to="/profile" onClick={() => setDropdownOpen(false)}>My Profile</Link>
                        <Link to="/orders" onClick={() => setDropdownOpen(false)}>Order History</Link>
                        <Link to="/addresses" onClick={() => setDropdownOpen(false)}>Saved Addresses</Link>
                        <Link to="/payment-methods" onClick={() => setDropdownOpen(false)}>Payment Methods</Link>
                        <Link to="/settings" onClick={() => setDropdownOpen(false)}>Settings</Link>
                      </div>
                      <div className="dropdown-footer">
                        <button onClick={handleLogout} className="logout-btn">Logout</button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="auth-buttons">
                <Link to="/login">
                  <button className="login-btn">Login</button>
                </Link>
                <Link to="/signup">
                  <button className="signup-btn">Sign Up</button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-container">
          <ul className="nav-links">
            <li><Link to="/" className="nav-item">Home</Link></li>
            <li><Link to="/categories/fruits" className="nav-item">Fruits & Vegetables</Link></li>
            <li><Link to="/categories/dairy" className="nav-item">Dairy & Bakery</Link></li>
            <li><Link to="/categories/meat" className="nav-item">Meat & Seafood</Link></li>
            <li><Link to="/categories/pantry" className="nav-item">Pantry Staples</Link></li>
            <li><Link to="/categories/snacks" className="nav-item">Snacks & Beverages</Link></li>
            <li><Link to="/categories/health" className="nav-item">Health & Beauty</Link></li>
            <li><Link to="/deals" className="nav-item deals">🔥 Special Deals</Link></li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Footer - Simplified */}
      <footer className="footer">
        <div className="footer-container">
          {/* Company Info */}
          <div className="footer-section">
            <h3>Apex Mart</h3>
            <p>Fresh groceries delivered to your door</p>
            <div className="social-icons">
              <a href="#" aria-label="Facebook"><FaFacebookF /></a>
              <a href="#" aria-label="Twitter"><FaTwitter /></a>
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4>Shop</h4>
            <ul>
              <li><Link to="/categories">All Categories</Link></li>
              <li><Link to="/deals">Special Deals</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h4>Contact</h4>
            <p><FaMapMarkerAlt /> India</p>
            <p><FaPhone /> +91 91212 09009</p>
            <p><FaEnvelope /> support@apexmart.com</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Apex Mart. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;