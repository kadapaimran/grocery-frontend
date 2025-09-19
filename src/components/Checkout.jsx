import { useState, useEffect } from "react";
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
      country: "US"
    }
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [cardType, setCardType] = useState('');
  const [showCvvInfo, setShowCvvInfo] = useState(false);
  const [touched, setTouched] = useState({});
  
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();
  
  // Get cart data from navigation state or context
  const cartData = location.state || {};
  const { cartItems = [], totalPrice = 0 } = cartData;

  // Redirect if no cart data
  useEffect(() => {
    if (!cartItems.length && totalPrice === 0) {
      navigate('/cart');
    }
  }, [cartItems.length, totalPrice, navigate]);

  // Detect card type based on number
  const detectCardType = (number) => {
    const cleanNumber = number.replace(/\s+/g, '');
    
    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    if (/^6(?:011|5)/.test(cleanNumber)) return 'discover';
    
    return '';
  };

  // Format card number with spaces and detect type
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const type = detectCardType(v);
    setCardType(type);
    
    let formatted = '';
    if (type === 'amex') {
      // Amex format: 4-6-5
      const match = v.match(/^(\d{0,4})(\d{0,6})(\d{0,5})/);
      formatted = [match[1], match[2], match[3]].filter(Boolean).join(' ');
    } else {
      // Standard format: 4-4-4-4
      const matches = v.match(/\d{4,16}/g);
      const match = matches && matches[0] || '';
      const parts = [];
      for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
      }
      formatted = parts.length ? parts.join(' ') : v;
    }
    
    return formatted;
  };

  // Luhn algorithm for card validation
  const isValidCardNumber = (number) => {
    const cleanNumber = number.replace(/\s+/g, '');
    let sum = 0;
    let isEven = false;
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i));
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cardNumber') {
      const formatted = formatCardNumber(value);
      const maxLength = cardType === 'amex' ? 17 : 19; // Including spaces
      if (formatted.length <= maxLength) {
        setFormData(prev => ({ ...prev, [name]: formatted }));
      }
    } else if (name === 'cvv') {
      const maxCvv = cardType === 'amex' ? 4 : 3;
      if (new RegExp(`^\\d{0,${maxCvv}}$`).test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else if (name === 'cardholderName') {
      // Allow only letters and spaces
      if (/^[a-zA-Z\s]*$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
      }
    } else if (name === 'zipCode' || name === 'billingAddress.zipCode') {
      // Allow only alphanumeric for ZIP codes
      if (/^[a-zA-Z0-9\s-]*$/.test(value)) {
        if (name.startsWith('billingAddress.')) {
          const field = name.split('.')[1];
          setFormData(prev => ({
            ...prev,
            billingAddress: { ...prev.billingAddress, [field]: value }
          }));
        } else {
          setFormData(prev => ({ ...prev, [name]: value }));
        }
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

  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateField(fieldName);
  };

  const validateField = (fieldName) => {
    const newErrors = { ...errors };
    
    switch (fieldName) {
      case 'cardNumber':
        const cardNumberClean = formData.cardNumber.replace(/\s/g, '');
        if (!cardNumberClean) {
          newErrors.cardNumber = 'Card number is required';
        } else if (!isValidCardNumber(cardNumberClean)) {
          newErrors.cardNumber = 'Please enter a valid card number';
        } else {
          delete newErrors.cardNumber;
        }
        break;
        
      case 'cvv':
        const expectedCvvLength = cardType === 'amex' ? 4 : 3;
        if (!formData.cvv) {
          newErrors.cvv = 'CVV is required';
        } else if (formData.cvv.length !== expectedCvvLength) {
          newErrors.cvv = `CVV must be ${expectedCvvLength} digits`;
        } else {
          delete newErrors.cvv;
        }
        break;
        
      case 'cardholderName':
        if (!formData.cardholderName.trim()) {
          newErrors.cardholderName = 'Cardholder name is required';
        } else if (formData.cardholderName.trim().length < 2) {
          newErrors.cardholderName = 'Please enter full name';
        } else {
          delete newErrors.cardholderName;
        }
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
          newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
          newErrors.email = 'Please enter a valid email';
        } else {
          delete newErrors.email;
        }
        break;
    }
    
    setErrors(newErrors);
    return !newErrors[fieldName];
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Card number validation
    const cardNumberClean = formData.cardNumber.replace(/\s/g, '');
    if (!cardNumberClean) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!isValidCardNumber(cardNumberClean)) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }
    
    // CVV validation
    const expectedCvvLength = cardType === 'amex' ? 4 : 3;
    if (!formData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (formData.cvv.length !== expectedCvvLength) {
      newErrors.cvv = `CVV must be ${expectedCvvLength} digits`;
    }
    
    // Expiry validation
    if (!formData.expiryMonth) newErrors.expiryMonth = 'Month is required';
    if (!formData.expiryYear) newErrors.expiryYear = 'Year is required';
    
    // Check if expiry date is in the future
    if (formData.expiryMonth && formData.expiryYear) {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      const expiryMonth = parseInt(formData.expiryMonth);
      const expiryYear = parseInt(formData.expiryYear);
      
      if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
        newErrors.expiryMonth = 'Card has expired';
      }
    }
    
    // Cardholder name validation
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    } else if (formData.cardholderName.trim().length < 2) {
      newErrors.cardholderName = 'Please enter full name';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    // Billing address validation
    if (!formData.billingAddress.street.trim()) {
      newErrors['billingAddress.street'] = 'Street address is required';
    }
    if (!formData.billingAddress.city.trim()) {
      newErrors['billingAddress.city'] = 'City is required';
    }
    if (!formData.billingAddress.zipCode.trim()) {
      newErrors['billingAddress.zipCode'] = 'ZIP code is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = document.querySelector('.form-group.error input, .form-group.error select');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorField.focus();
      }
      return;
    }
    
    setIsLoading(true);
    
    try {
      const paymentData = {
        ...formData,
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        amount: totalPrice,
        items: cartItems,
        cardType
      };
      
      const success = await processPayment(paymentData);
      
      if (success) {
        clearCart();
        navigate("/order-confirmation", { 
          state: { 
            orderTotal: totalPrice,
            orderItems: cartItems,
            paymentMethod: `**** **** **** ${formData.cardNumber.slice(-4)}`,
            email: formData.email
          }
        });
      } else {
        setErrors({ payment: "Payment failed. Please check your details and try again." });
      }
    } catch (error) {
      console.error("Payment error:", error);
      setErrors({ payment: "An error occurred during payment. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate year options (current year + 10 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear + i);

  const getCardIcon = () => {
    switch (cardType) {
      case 'visa': return '💳';
      case 'mastercard': return '💳';
      case 'amex': return '💳';
      case 'discover': return '💳';
      default: return '💳';
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>Secure Checkout</h1>
        <div className="security-badge">
          <span className="lock-icon">🔒</span>
          <span>SSL Encrypted</span>
        </div>
      </div>
      
      <div className="checkout-content">
        {/* Order Summary */}
        <div className="order-summary-card">
          <h3>Order Summary</h3>
          <div className="order-items">
            {cartItems.map((item, index) => (
              <div key={index} className="order-item">
                <span className="item-name">{item.name}</span>
                <span className="item-quantity">×{item.quantity}</span>
                <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="order-total">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Tax:</span>
              <span>$0.00</span>
            </div>
            <div className="total-row total-final">
              <span>Total:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <form className="checkout-form" onSubmit={(e) => e.preventDefault()}>
          {/* Payment Error Display */}
          {errors.payment && (
            <div className="payment-error">
              <span className="error-icon">⚠️</span>
              {errors.payment}
            </div>
          )}
          
          {/* Payment Information */}
          <div className="form-section">
            <h3>💳 Payment Information</h3>
            
            <div className={`form-group ${errors.cardholderName ? 'error' : ''}`}>
              <label htmlFor="cardholderName">Cardholder Name *</label>
              <input
                type="text"
                id="cardholderName"
                name="cardholderName"
                value={formData.cardholderName}
                onChange={handleInputChange}
                onBlur={() => handleBlur('cardholderName')}
                placeholder="JOHN DOE"
                autoComplete="cc-name"
              />
              {errors.cardholderName && <span className="error-text">{errors.cardholderName}</span>}
            </div>
            
            <div className={`form-group card-number-group ${errors.cardNumber ? 'error' : ''}`}>
              <label htmlFor="cardNumber">Card Number *</label>
              <div className="card-input-wrapper">
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('cardNumber')}
                  placeholder="1234 5678 9012 3456"
                  autoComplete="cc-number"
                />
                <span className="card-icon">{getCardIcon()}</span>
              </div>
              {errors.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
            </div>
            
            <div className="form-row">
              <div className={`form-group ${errors.expiryMonth ? 'error' : ''}`}>
                <label htmlFor="expiryMonth">Expiry Month *</label>
                <select
                  id="expiryMonth"
                  name="expiryMonth"
                  value={formData.expiryMonth}
                  onChange={handleInputChange}
                  autoComplete="cc-exp-month"
                >
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {String(i + 1).padStart(2, '0')}
                    </option>
                  ))}
                </select>
                {errors.expiryMonth && <span className="error-text">{errors.expiryMonth}</span>}
              </div>
              
              <div className={`form-group ${errors.expiryYear ? 'error' : ''}`}>
                <label htmlFor="expiryYear">Expiry Year *</label>
                <select
                  id="expiryYear"
                  name="expiryYear"
                  value={formData.expiryYear}
                  onChange={handleInputChange}
                  autoComplete="cc-exp-year"
                >
                  <option value="">YYYY</option>
                  {yearOptions.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                {errors.expiryYear && <span className="error-text">{errors.expiryYear}</span>}
              </div>
              
              <div className={`form-group cvv-group ${errors.cvv ? 'error' : ''}`}>
                <label htmlFor="cvv">
                  CVV *
                  <button
                    type="button"
                    className="info-btn"
                    onMouseEnter={() => setShowCvvInfo(true)}
                    onMouseLeave={() => setShowCvvInfo(false)}
                  >
                    ❓
                  </button>
                  {showCvvInfo && (
                    <div className="cvv-tooltip">
                      {cardType === 'amex' ? 
                        '4-digit code on front of card' : 
                        '3-digit code on back of card'
                      }
                    </div>
                  )}
                </label>
                <input
                  type="text"
                  id="cvv"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('cvv')}
                  placeholder={cardType === 'amex' ? '1234' : '123'}
                  autoComplete="cc-csc"
                />
                {errors.cvv && <span className="error-text">{errors.cvv}</span>}
              </div>
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="form-section">
            <h3>📧 Contact Information</h3>
            <div className={`form-group ${errors.email ? 'error' : ''}`}>
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={() => handleBlur('email')}
                placeholder="john@example.com"
                autoComplete="email"
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
              <small className="field-hint">We'll send your receipt to this email</small>
            </div>
          </div>
          
          {/* Billing Address */}
          <div className="form-section">
            <h3>🏠 Billing Address</h3>
            
            <div className={`form-group ${errors['billingAddress.street'] ? 'error' : ''}`}>
              <label htmlFor="billingAddress.street">Street Address *</label>
              <input
                type="text"
                id="billingAddress.street"
                name="billingAddress.street"
                value={formData.billingAddress.street}
                onChange={handleInputChange}
                placeholder="123 Main Street"
                autoComplete="billing street-address"
              />
              {errors['billingAddress.street'] && <span className="error-text">{errors['billingAddress.street']}</span>}
            </div>
            
            <div className="form-row">
              <div className={`form-group ${errors['billingAddress.city'] ? 'error' : ''}`}>
                <label htmlFor="billingAddress.city">City *</label>
                <input
                  type="text"
                  id="billingAddress.city"
                  name="billingAddress.city"
                  value={formData.billingAddress.city}
                  onChange={handleInputChange}
                  placeholder="New York"
                  autoComplete="billing locality"
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
                  autoComplete="billing region"
                />
              </div>
              
              <div className={`form-group ${errors['billingAddress.zipCode'] ? 'error' : ''}`}>
                <label htmlFor="billingAddress.zipCode">ZIP Code *</label>
                <input
                  type="text"
                  id="billingAddress.zipCode"
                  name="billingAddress.zipCode"
                  value={formData.billingAddress.zipCode}
                  onChange={handleInputChange}
                  placeholder="10001"
                  autoComplete="billing postal-code"
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
              ← Back to Cart
            </button>
            
            <button 
              type="button"
              className={`pay-btn ${isLoading ? 'loading' : ''}`}
              onClick={handlePayment}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Processing...
                </>
              ) : (
                <>
                  🔒 Pay ${totalPrice.toFixed(2)}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
