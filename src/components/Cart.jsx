import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import "../styles/cart/Cart.css";

const BASE_URL = 'http://localhost:8088';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Calculate total price
  const totalPrice = cartItems.reduce((total, item) => {
    return total + (item.price * (item.quantity || 1));
  }, 0);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    
    setIsLoading(true);
    try {
      // Add any pre-checkout logic here if needed
      navigate("/payment", { state: { cartItems, totalPrice } });
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      clearCart();
    }
  };

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Shopping Cart ({cartItems.length} items)</h2>
        {cartItems.length > 0 && (
          <button 
            className="clear-cart-btn" 
            onClick={handleClearCart}
            aria-label="Clear entire cart"
          >
            Clear Cart
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button 
            className="continue-shopping-btn" 
            onClick={() => navigate("/")}
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <img
                    src={item.imagePath}  // Use the full link directly
                    alt={item.name}
                    onError={(e) => {
                    e.target.src = '/placeholder-image.jpg'; // Fallback image
                  }}
                />

                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p className="item-price">${item.price.toFixed(2)}</p>
                  {item.description && (
                    <p className="item-description">{item.description}</p>
                  )}
                </div>
                
                <div className="quantity-controls">
                  <button 
                    onClick={() => handleQuantityChange(item.id, (item.quantity || 1) - 1)}
                    disabled={item.quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity || 1}</span>
                  <button 
                    onClick={() => handleQuantityChange(item.id, (item.quantity || 1) + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <div className="item-total">
                  ${((item.price) * (item.quantity || 1)).toFixed(2)}
                </div>

                <button 
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                  aria-label={`Remove ${item.name} from cart`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="total-section">
              <h3>Total: ${totalPrice.toFixed(2)}</h3>
            </div>
            
            <div className="cart-actions">
              <button 
                className="continue-shopping-btn" 
                onClick={() => navigate("/")}
              >
                Continue Shopping
              </button>
              <button 
                className="checkout-btn"
                onClick={handleCheckout}
                disabled={isLoading || cartItems.length === 0}
              >
                {isLoading ? "Processing..." : "Proceed to Checkout"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;