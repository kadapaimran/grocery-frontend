// ProductPage.jsx - Improved React Component (Null-Safe & Fixed)
import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProducts } from "../services/productService";
import { useCart } from "../context/CartContext";
import "../styles/Products/ProductPage.css"; // Custom CSS file

const ProductPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState({});
  const [sortBy, setSortBy] = useState("name");
  const [filterBy, setFilterBy] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Price ranges configuration (in Rupees)
  const PRICE_RANGES = useMemo(() => ({
    "under-1000": [0, 1000],
    "1000-5000": [1000, 5000],
    "5000-20000": [5000, 20000],
    "over-20000": [20000, Infinity],
  }), []);

  // Default image for broken links
  const DEFAULT_IMAGE = "https://via.placeholder.com/300x300/f0f0f0/666666?text=No+Image";

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProducts(category || "");
        // Ensure we always have an array, even if API returns null/undefined
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Failed to load products. Please try again later.");
        setProducts([]); // Ensure products is always an array
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  const handleAddToCart = useCallback(async (product) => {
    setAddingToCart((prev) => ({ ...prev, [product.id]: true }));
    
    try {
      await addToCart(product);
      showToast("Added to cart successfully!", "success");
    } catch (error) {
      console.error("Failed to add to cart:", error);
      showToast("Failed to add to cart. Please try again.", "error");
    } finally {
      setAddingToCart((prev) => ({ ...prev, [product.id]: false }));
    }
  }, [addToCart]);

  const showToast = (message, type) => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('toast-show'), 100);
    
    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  const handleProductClick = useCallback((id) => {
    navigate(`/product/${id}`);
  }, [navigate]);

  const handleImageError = useCallback((e) => {
    e.target.src = DEFAULT_IMAGE;
    e.target.classList.add('fallback-image');
  }, []);

  const handleImageLoad = useCallback((e) => {
    e.target.classList.add('image-loaded');
  }, []);

  // 🔧 FIXED: Optimized filtering and sorting with useMemo (TRULY null-safe)
  const filteredProducts = useMemo(() => {
    // Double-check that we have valid data
    if (!products || !Array.isArray(products) || !products.length) {
      return [];
    }

    // Filter out completely null/undefined products first
    let result = products.filter(product => product != null);

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((product) => {
        const name = product.name || "";
        const description = product.description || "";
        return name.toLowerCase().includes(searchLower) ||
               description.toLowerCase().includes(searchLower);
      });
    }

    // Price filter
    if (filterBy !== "all" && PRICE_RANGES[filterBy]) {
      const [min, max] = PRICE_RANGES[filterBy];
      result = result.filter((product) => {
        const price = Number(product.price) || 0;
        return price >= min && (max === Infinity ? price >= max : price < max);
      });
    }

    // 🔧 FIXED: Sorting (TRULY null-safe)
    result.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (Number(a.price) || 0) - (Number(b.price) || 0);
        case "price-high":
          return (Number(b.price) || 0) - (Number(a.price) || 0);
        case "name":
        default: {
          // ✅ FIX: Convert null/undefined to empty string using String()
          const nameA = String(a?.name ?? "");
          const nameB = String(b?.name ?? "");
          return nameA.localeCompare(nameB);
        }
      }
    });

    return result;
  }, [products, searchTerm, filterBy, sortBy, PRICE_RANGES]);

  // Loading state
  if (loading) {
    return (
      <div className="product-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="product-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const categoryTitle = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : "All Products";

  return (
    <div className="product-container">
      <header className="product-header">
        <h1 className="page-title">{categoryTitle}</h1>
        <p className="product-count">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
        </p>
      </header>

      {/* Enhanced Controls */}
      <div className="product-controls">
        <div className="search-wrapper">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              aria-label="Search products"
            />
            <div className="search-icon">🔍</div>
          </div>
        </div>
        
        <div className="filter-controls">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="control-select sort-select"
            aria-label="Sort products"
          >
            <option value="name">Sort by Name</option>
            <option value="price-low">Price: Low → High</option>
            <option value="price-high">Price: High → Low</option>
          </select>
          
          <select 
            value={filterBy} 
            onChange={(e) => setFilterBy(e.target.value)}
            className="control-select filter-select"
            aria-label="Filter by price"
          >
            <option value="all">All Prices</option>
            <option value="under-1000">Under ₹1,000</option>
            <option value="1000-5000">₹1,000 - ₹5,000</option>
            <option value="5000-20000">₹5,000 - ₹20,000</option>
            <option value="over-20000">Over ₹20,000</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="no-products">
          <div className="no-products-icon">📦</div>
          <h3>No products found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <article key={product.id} className="product-card">
              <div className="product-image-container">
                <img
                  src={product.imagePath || DEFAULT_IMAGE}
                  alt={product.name || "Unnamed Product"}
                  onClick={() => handleProductClick(product.id)}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  className="product-image"
                  loading="lazy"
                />
                <div className="product-overlay">
                  <button className="quick-view-btn">Quick View</button>
                </div>
              </div>
              
              <div className="product-info">
                <h3 className="product-name">{product.name || "Unnamed Product"}</h3>
                {product.description && (
                  <p className="product-description">{product.description}</p>
                )}
                <div className="price-container">
                  <span className="product-price">
                    ₹{(Number(product.price) || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={addingToCart[product.id]}
                  className={`add-to-cart-btn ${addingToCart[product.id] ? 'loading' : ''}`}
                  aria-label={`Add ${product.name || "product"} to cart`}
                >
                  {addingToCart[product.id] ? (
                    <>
                      <span className="btn-spinner"></span>
                      Adding...
                    </>
                  ) : (
                    <>
                      <span className="cart-icon">🛒</span>
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductPage;
