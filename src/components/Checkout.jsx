import  { useState } from "react";
import { processPayment } from "../services/paymentService";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../styles/cart/Checkout.css";

const Checkout = () => {
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardholderName: "",
    email: "",
    billingAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: ""
    }
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();
  
  // Get cart data from navigation state or context
  const cartData = location.state || {};
  const { cartItems = [], totalPrice = 0 } = cartData;

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cardNumber') {
      const formatted = formatCardNumber(value);
      if (formatted.replace(/\s/g, '').length <= 16) {
        setFormData(prev => ({ ...prev, [name]: formatted }));
      }
    } else if (name === 'cvv') {
      if (/^\d{0,4}$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else if (name.startsWith('billingAddress.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        billingAddress: { ...prev.billingAddress, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Card number validation
    const cardNumberClean = formData.cardNumber.replace(/\s/g, '');
    if (!cardNumberClean) {
      newErrors.cardNumber = 'Card number is required';
    } else if (cardNumberClean.length < 13 || cardNumberClean.length > 19) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }
    
    // CVV validation
    if (!formData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (formData.cvv.length < 3) {
      newErrors.cvv = 'CVV must be at least 3 digits';
    }
    
    // Expiry validation
    if (!formData.expiryMonth) newErrors.expiryMonth = 'Month is required';
    if (!formData.expiryYear) newErrors.expiryYear = 'Year is required';
    
    // Check if expiry date is in the future
    if (formData.expiryMonth && formData.expiryYear) {
      const currentDate = new Date();
      const expiryDate = new Date(parseInt(formData.expiryYear), parseInt(formData.expiryMonth) - 1);
      if (expiryDate <= currentDate) {
        newErrors.expiryMonth = 'Card has expired';
      }
    }
    
    // Cardholder name validation
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    // Billing address validation
    if (!formData.billingAddress.street.trim()) newErrors['billingAddress.street'] = 'Street address is required';
    if (!formData.billingAddress.city.trim()) newErrors['billingAddress.city'] = 'City is required';
    if (!formData.billingAddress.zipCode.trim()) newErrors['billingAddress.zipCode'] = 'ZIP code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const paymentData = {
        ...formData,
        cardNumber: formData.cardNumber.replace(/\s/g, ''), // Remove spaces for processing
        amount: totalPrice,
        items: cartItems
      };
      
      const success = await processPayment(paymentData);
      
      if (!success) {
        // Clear cart after successful payment
        clearCart();
        alert("Payment Successful! Thank you for your purchase.");
        navigate("/order-confirmation", { 
          state: { 
            orderTotal: totalPrice,
            orderItems: cartItems 
          }
        });
      } else {
        alert("Payment Failed. Please check your details and try again.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("An error occurred during payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate year options (current year + 10 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear + i);

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      
      {/* Order Summary */}
      {totalPrice > 0 && (
        <div className="order-summary">
          <h3>Order Summary</h3>
          <p>Total Items: {cartItems.length}</p>
          <p className="total-amount">Total: ${totalPrice.toFixed(2)}</p>
        </div>
      )}
      
      <form className="checkout-form" onSubmit={(e) => e.preventDefault()}>
        {/* Payment Information */}
        <div className="form-section">
          <h3>Payment Information</h3>
          
          <div className="form-group">
            <label htmlFor="cardholderName">Cardholder Name *</label>
            <input
              type="text"
              id="cardholderName"
              name="cardholderName"
              value={formData.cardholderName}
              onChange={handleInputChange}
              className={errors.cardholderName ? 'error' : ''}
              placeholder="John Doe"
            />
            {errors.cardholderName && <span className="error-text">{errors.cardholderName}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="cardNumber">Card Number *</label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleInputChange}
              className={errors.cardNumber ? 'error' : ''}
              placeholder="1234 5678 9012 3456"
              maxLength="19"
            />
            {errors.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="expiryMonth">Expiry Month *</label>
              <select
                id="expiryMonth"
                name="expiryMonth"
                value={formData.expiryMonth}
                onChange={handleInputChange}
                className={errors.expiryMonth ? 'error' : ''}
              >
                <option value="">Month</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {String(i + 1).padStart(2, '0')}
                  </option>
                ))}
              </select>
              {errors.expiryMonth && <span className="error-text">{errors.expiryMonth}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="expiryYear">Expiry Year *</label>
              <select
                id="expiryYear"
                name="expiryYear"
                value={formData.expiryYear}
                onChange={handleInputChange}
                className={errors.expiryYear ? 'error' : ''}
              >
                <option value="">Year</option>
                {yearOptions.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {errors.expiryYear && <span className="error-text">{errors.expiryYear}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="cvv">CVV *</label>
              <input
                type="text"
                id="cvv"
                name="cvv"
                value={formData.cvv}
                onChange={handleInputChange}
                className={errors.cvv ? 'error' : ''}
                placeholder="123"
                maxLength="4"
              />
              {errors.cvv && <span className="error-text">{errors.cvv}</span>}
            </div>
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="form-section">
          <h3>Contact Information</h3>
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'error' : ''}
              placeholder="john@example.com"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
        </div>
        
        {/* Billing Address */}
        <div className="form-section">
          <h3>Billing Address</h3>
          
          <div className="form-group">
            <label htmlFor="billingAddress.street">Street Address *</label>
            <input
              type="text"
              id="billingAddress.street"
              name="billingAddress.street"
              value={formData.billingAddress.street}
              onChange={handleInputChange}
              className={errors['billingAddress.street'] ? 'error' : ''}
              placeholder="123 Main Street"
            />
            {errors['billingAddress.street'] && <span className="error-text">{errors['billingAddress.street']}</span>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="billingAddress.city">City *</label>
              <input
                type="text"
                id="billingAddress.city"
                name="billingAddress.city"
                value={formData.billingAddress.city}
                onChange={handleInputChange}
                className={errors['billingAddress.city'] ? 'error' : ''}
                placeholder="New York"
              />
              {errors['billingAddress.city'] && <span className="error-text">{errors['billingAddress.city']}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="billingAddress.state">State</label>
              <input
                type="text"
                id="billingAddress.state"
                name="billingAddress.state"
                value={formData.billingAddress.state}
                onChange={handleInputChange}
                placeholder="NY"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="billingAddress.zipCode">ZIP Code *</label>
              <input
                type="text"
                id="billingAddress.zipCode"
                name="billingAddress.zipCode"
                value={formData.billingAddress.zipCode}
                onChange={handleInputChange}
                className={errors['billingAddress.zipCode'] ? 'error' : ''}
                placeholder="10001"
              />
              {errors['billingAddress.zipCode'] && <span className="error-text">{errors['billingAddress.zipCode']}</span>}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="form-actions">
          <button 
            type="button"
            className="back-btn"
            onClick={() => navigate('/cart')}
            disabled={isLoading}
          >
            Back to Cart
          </button>
          
          <button 
            type="button"
            className="pay-btn"
            onClick={handlePayment}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : `Pay $${totalPrice.toFixed(2)}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;