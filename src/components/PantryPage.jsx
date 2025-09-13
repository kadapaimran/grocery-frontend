import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../services/productService";
import { useCart } from "../context/CartContext";
import "../styles/Products/PantryPage.css";

const PantryPage = () => {
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
    "under-200": [0, 200],
    "200-500": [200, 500],
    "500-1000": [500, 1000],
    "1000-2000": [1000, 2000],
    "over-2000": [2000, Infinity],
  }), []);

  // Default image for broken links
  const DEFAULT_IMAGE = "https://th.bing.com/th/id/OIP.GnuiCdcsDyWxYZFfes4aTAHaHa?w=209&h=209&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3";

  useEffect(() => {
    const fetchPantryProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch products specifically for "pantry" category
        const data = await getProducts("pantry");
        setProducts(data || []);
      } catch (err) {
        console.error("Failed to fetch pantry products:", err);
        setError("Failed to load pantry products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPantryProducts();
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
        (product.brand && product.brand.toLowerCase().includes(searchLower)) ||
        (product.category && product.category.toLowerCase().includes(searchLower)) ||
        (product.type && product.type.toLowerCase().includes(searchLower))
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
        case "expiry":
          return new Date(a.expiryDate || '9999-12-31') - new Date(b.expiryDate || '9999-12-31');
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
      <div className="pantry-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading pantry essentials...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="pantry-container">
        <div className="error-message">
          <div className="error-icon">🥫</div>
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
    <div className="pantry-container">
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
        <span className="breadcrumb-current">Pantry</span>
      </nav>

      {/* Header */}
      <header className="pantry-header">
        <div className="header-content">
          <div className="header-icon">🥫</div>
          <div className="header-text">
            <h1>Pantry Essentials</h1>
            <p className="header-description">
              Stock up on quality staples, grains, spices, and shelf-stable goods for your kitchen
            </p>
          </div>
        </div>
        <div className="product-count">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} available
        </div>
      </header>

      {/* Controls */}
      <div className="pantry-controls">
        <div className="search-wrapper">
          <div className="search-icon">🔍</div>
          <input
            type="text"
            placeholder="Search pantry items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            aria-label="Search pantry products"
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
            <option value="expiry">Expiry Date</option>
            <option value="popular">Most Popular</option>
          </select>
          
          <select 
            value={filterBy} 
            onChange={(e) => setFilterBy(e.target.value)}
            className="filter-select"
            aria-label="Filter by price"
          >
            <option value="all">All Prices</option>
            <option value="under-200">Under ₹200</option>
            <option value="200-500">₹200 - ₹500</option>
            <option value="500-1000">₹500 - ₹1000</option>
            <option value="1000-2000">₹1000 - ₹2000</option>
            <option value="over-2000">Over ₹2000</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="no-products">
          <div className="no-products-icon">📦</div>
          <h3>No pantry products found</h3>
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
              <h2 className="section-title">⭐ Featured Pantry Items</h2>
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
            <h2 className="section-title">All Pantry Essentials</h2>
            <div className="pantry-grid">
              {filteredProducts.map((product) => (
                <article key={product.id} className="pantry-card">
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
                    {product.glutenFree && (
                      <div className="gluten-free-badge">
                        Gluten Free
                      </div>
                    )}
                    {product.bulkSize && (
                      <div className="bulk-badge">
                        Bulk
                      </div>
                    )}
                    {product.familySize && (
                      <div className="family-badge">
                        Family Size
                      </div>
                    )}
                    {product.longShelfLife && (
                      <div className="shelf-life-badge">
                        Long Lasting
                      </div>
                    )}
                  </div>
                  
                  <div className="card-content">
                    <h3 className="product-name">{product.name}</h3>
                    
                    {product.description && (
                      <p className="product-description">{product.description}</p>
                    )}
                    
                    {product.brand && (
                      <div className="product-brand">
                        <span className="brand-label">Brand:</span>
                        <span className="brand-value">{product.brand}</span>
                      </div>
                    )}
                    
                    {product.size && (
                      <div className="product-size">
                        <span className="size-label">Size:</span>
                        <span className="size-value">{product.size}</span>
                      </div>
                    )}
                    
                    {product.weight && (
                      <div className="product-weight">
                        <span className="weight-label">Weight:</span>
                        <span className="weight-value">{product.weight}</span>
                      </div>
                    )}
                    
                    {product.expiryDate && (
                      <div className="product-expiry">
                        <span className="expiry-label">Best By:</span>
                        <span className="expiry-value">
                          {new Date(product.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    {product.storageInstructions && (
                      <div className="product-storage">
                        <span className="storage-label">Storage:</span>
                        <span className="storage-value">{product.storageInstructions}</span>
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
                    
                    {product.nutritionHighlights && (
                      <div className="nutrition-highlights">
                        {product.nutritionHighlights.slice(0, 3).map((highlight, index) => (
                          <span key={index} className="nutrition-highlight">
                            {highlight}
                          </span>
                        ))}
                      </div>
                    )}
                    
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

export default PantryPage;