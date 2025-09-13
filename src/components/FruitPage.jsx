import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../services/productService";
import { useCart } from "../context/CartContext";
import "../styles/Products/FruitsPage.css";

const FruitsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState({});
  const [sortBy, setSortBy] = useState("name");
  const [filterBy, setFilterBy] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Price ranges configuration
  const PRICE_RANGES = useMemo(() => ({
    "under-30": [0, 30],
    "30-80": [30, 80],
    "80-150": [80, 150],
    "over-150": [150, Infinity],
  }), []);

  // Default image for broken links
  const DEFAULT_IMAGE = "https://th.bing.com/th/id/OIP.GnuiCdcsDyWxYZFfes4aTAHaHa?w=209&h=209&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3";

  useEffect(() => {
    const fetchFruitProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch products specifically for "fruits" category
        const data = await getProducts("fruits");
        setProducts(data || []);
      } catch (err) {
        console.error("Failed to fetch fruit products:", err);
        setError("Failed to load fruit products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFruitProducts();
  }, []);

  const handleAddToCart = useCallback(async (product) => {
    setAddingToCart((prev) => ({ ...prev, [product.id]: true }));
    
    try {
      await addToCart(product);
      // Consider using a toast notification instead of alert
      alert(`${product.name} added to cart!`);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      alert("Failed to add to cart. Please try again.");
    } finally {
      setAddingToCart((prev) => ({ ...prev, [product.id]: false }));
    }
  }, [addToCart]);

  const handleProductClick = useCallback((id) => {
    navigate(`/product/${id}`);
  }, [navigate]);

  const handleImageError = useCallback((e) => {
    e.target.src = DEFAULT_IMAGE;
  }, []);

  const handleBackToCategories = useCallback(() => {
    navigate("/categories");
  }, [navigate]);

  // Optimized filtering and sorting with useMemo
  const filteredProducts = useMemo(() => {
    if (!products.length) return [];

    let result = [...products];

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((product) =>
        product.name.toLowerCase().includes(searchLower) ||
        (product.description && product.description.toLowerCase().includes(searchLower)) ||
        (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchLower))) ||
        (product.variety && product.variety.toLowerCase().includes(searchLower)) ||
        (product.origin && product.origin.toLowerCase().includes(searchLower))
      );
    }

    // Price filter
    if (filterBy !== "all" && PRICE_RANGES[filterBy]) {
      const [min, max] = PRICE_RANGES[filterBy];
      result = result.filter((product) => 
        product.price >= min && product.price < max
      );
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "newest":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [products, searchTerm, filterBy, sortBy, PRICE_RANGES]);

  // Loading state
  if (loading) {
    return (
      <div className="fruits-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading fresh fruits...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fruits-container">
        <div className="error-message">
          <div className="error-icon">🍎</div>
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={() => window.location.reload()} className="retry-btn">
              Try Again
            </button>
            <button onClick={handleBackToCategories} className="back-btn">
              Back to Categories
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fruits-container">
      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb">
        <button onClick={() => navigate("/")} className="breadcrumb-link">
          Home
        </button>
        <span className="breadcrumb-separator">›</span>
        <button onClick={handleBackToCategories} className="breadcrumb-link">
          Categories
        </button>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">Fruits</span>
      </nav>

      {/* Header */}
      <header className="fruits-header">
        <div className="header-content">
          <div className="header-icon">🍎</div>
          <div className="header-text">
            <h1>Fresh Fruit Paradise</h1>
            <p className="header-description">
              Natures candy at its finest - fresh, juicy, and packed with vitamins for a healthy lifestyle
            </p>
          </div>
        </div>
        <div className="product-count">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} available
        </div>
      </header>

      {/* Controls */}
      <div className="fruits-controls">
        <div className="search-wrapper">
          <div className="search-icon">🔍</div>
          <input
            type="text"
            placeholder="Search fresh fruits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            aria-label="Search fruit products"
          />
        </div>
        
        <div className="filter-controls">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
            aria-label="Sort products"
          >
            <option value="name">Sort by Name</option>
            <option value="price-low">Price: Low → High</option>
            <option value="price-high">Price: High → Low</option>
            <option value="newest">Newest First</option>
            <option value="popular">Most Popular</option>
          </select>
          
          <select 
            value={filterBy} 
            onChange={(e) => setFilterBy(e.target.value)}
            className="filter-select"
            aria-label="Filter by price"
          >
            <option value="all">All Prices</option>
            <option value="under-30">Under ₹30</option>
            <option value="30-80">₹30 - ₹80</option>
            <option value="80-150">₹80 - ₹150</option>
            <option value="over-150">Over ₹150</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="no-products">
          <div className="no-products-icon">🍌</div>
          <h3>No fruit products found</h3>
          <p>Try adjusting your search or filter criteria</p>
          <button onClick={() => {
            setSearchTerm("");
            setFilterBy("all");
          }} className="clear-filters-btn">
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          {/* Featured Products Banner (if any) */}
          {filteredProducts.some(p => p.featured) && (
            <section className="featured-section">
              <h2 className="section-title">✨ Featured Fruits</h2>
              <div className="featured-grid">
                {filteredProducts
                  .filter(p => p.featured)
                  .slice(0, 3)
                  .map((product) => (
                    <div key={`featured-${product.id}`} className="featured-card">
                      <div className="featured-badge">Featured</div>
                      <img
                        src={product.imagePath}
                        alt={product.name}
                        onError={handleImageError}
                        className="featured-image"
                      />
                      <div className="featured-info">
                        <h3>{product.name}</h3>
                        <p>₹{product.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* Main Products Grid */}
          <section className="products-section">
            <h2 className="section-title">All Fresh Fruits</h2>
            <div className="fruits-grid">
              {filteredProducts.map((product) => (
                <article key={product.id} className="fruit-card">
                  <div className="card-image-wrapper">
                    <img
                      src={product.imagePath}
                      alt={product.name}
                      onClick={() => handleProductClick(product.id)}
                      onError={handleImageError}
                      className="card-image"
                      loading="lazy"
                    />
                    {product.discount && (
                      <div className="discount-badge">
                        -{product.discount}%
                      </div>
                    )}
                    {product.isNew && (
                      <div className="new-badge">New</div>
                    )}
                    {product.organic && (
                      <div className="organic-badge">
                        Organic
                      </div>
                    )}
                    {product.localGrown && (
                      <div className="local-badge">
                        Local
                      </div>
                    )}
                    {product.seasonalSpecial && (
                      <div className="seasonal-badge">
                        Seasonal
                      </div>
                    )}
                  </div>
                  
                  <div className="card-content">
                    <h3 className="product-name">{product.name}</h3>
                    
                    {product.description && (
                      <p className="product-description">{product.description}</p>
                    )}
                    
                    {product.variety && (
                      <div className="product-variety">
                        <span className="variety-label">Variety:</span>
                        <span className="variety-value">{product.variety}</span>
                      </div>
                    )}
                    
                    {product.origin && (
                      <div className="product-origin">
                        <span className="origin-label">Origin:</span>
                        <span className="origin-value">{product.origin}</span>
                      </div>
                    )}
                    
                    {product.ripeness && (
                      <div className="product-ripeness">
                        <span className="ripeness-label">Ripeness:</span>
                        <span className="ripeness-value">{product.ripeness}</span>
                      </div>
                    )}
                    
                    {product.rating && (
                      <div className="product-rating">
                        <span className="stars">
                          {"★".repeat(Math.floor(product.rating))}
                          {"☆".repeat(5 - Math.floor(product.rating))}
                        </span>
                        <span className="rating-text">({product.rating})</span>
                      </div>
                    )}
                    
                    <div className="price-section">
                      {product.originalPrice && product.originalPrice !== product.price && (
                        <span className="original-price">${product.originalPrice.toFixed(2)}</span>
                      )}
                      <span className="current-price">₹{product.price.toFixed(2)}</span>
                      {product.pricePerUnit && (
                        <span className="price-per-unit">({product.pricePerUnit})</span>
                      )}
                    </div>
                    
                    {product.tags && (
                      <div className="product-tags">
                        {product.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="tag">#{tag}</span>
                        ))}
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={addingToCart[product.id]}
                      className={`add-to-cart-btn ${addingToCart[product.id] ? 'loading' : ''}`}
                      aria-label={`Add ${product.name} to cart`}
                    >
                      {addingToCart[product.id] ? (
                        <>
                          <span className="loading-spinner-sm"></span>
                          Adding...
                        </>
                      ) : (
                        <>
                          🛒 Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default FruitsPage;