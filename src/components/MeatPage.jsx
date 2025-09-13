import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../services/productService";
import { useCart } from "../context/CartContext";
import "../styles/Products/MeatPage.css";

const MeatPage = () => {
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
    "under-100": [0, 100],
    "100-250": [100, 250],
    "250-500": [250, 500],
    "over-500": [500, Infinity],
  }), []);

  // Default image for broken links
  const DEFAULT_IMAGE = "https://th.bing.com/th/id/OIP.GnuiCdcsDyWxYZFfes4aTAHaHa?w=209&h=209&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3";

  useEffect(() => {
    const fetchMeatProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch products specifically for "meat" category
        const data = await getProducts("meat");
        setProducts(data || []);
      } catch (err) {
        console.error("Failed to fetch meat products:", err);
        setError("Failed to load meat products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMeatProducts();
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
        (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchLower)))
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
        case "popular":
          return (b.rating || 0) - (a.rating || 0);
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
      <div className="meat-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading meat products...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="meat-container">
        <div className="error-message">
          <div className="error-icon">🥩</div>
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
    <div className="meat-container">
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
        <span className="breadcrumb-current">Meat</span>
      </nav>

      {/* Header */}
      <header className="meat-header">
        <div className="header-content">
          <div className="header-icon">🥩</div>
          <div className="header-text">
            <h1>Premium Meat Collection</h1>
            <p className="header-description">
              Fresh, high-quality meat products sourced from trusted suppliers for your culinary needs
            </p>
          </div>
        </div>
        <div className="product-count">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} available
        </div>
      </header>

      {/* Controls */}
      <div className="meat-controls">
        <div className="search-wrapper">
          <div className="search-icon">🔍</div>
          <input
            type="text"
            placeholder="Search meat products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            aria-label="Search meat products"
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
            <option value="under-100">Under $100</option>
            <option value="100-250">$100 - $250</option>
            <option value="250-500">$250 - $500</option>
            <option value="over-500">Over $500</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="no-products">
          <div className="no-products-icon">🍖</div>
          <h3>No meat products found</h3>
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
              <h2 className="section-title">✨ Featured Meats</h2>
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
                        <p>${product.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* Main Products Grid */}
          <section className="products-section">
            <h2 className="section-title">All Meat Products</h2>
            <div className="meat-grid">
              {filteredProducts.map((product) => (
                <article key={product.id} className="meat-card">
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
                    {product.freshness && (
                      <div className="freshness-badge">
                        {product.freshness}
                      </div>
                    )}
                  </div>
                  
                  <div className="card-content">
                    <h3 className="product-name">{product.name}</h3>
                    
                    {product.description && (
                      <p className="product-description">{product.description}</p>
                    )}
                    
                    {product.weight && (
                      <div className="product-weight">
                        <span className="weight-label">Weight:</span>
                        <span className="weight-value">{product.weight}</span>
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
                        <span className="original-price">₹{product.originalPrice.toFixed(2)}</span>
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

export default MeatPage;