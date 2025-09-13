import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/cart/Payment.css";
import { useCart } from "../context/CartContext";

const Payment = () => {
  const { cartItems, completePayment } = useCart();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardholderName: "",
    paypalEmail: "",
    saveInfo: false,
    sameAsBilling: true,
  });

  const [errors, setErrors] = useState({});
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
  });

  // Calculate totals
  useEffect(() => {
    const subtotal = cartItems.reduce(
      (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
      0
    );
    const shipping = subtotal > 100 ? 0 : 15.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    setOrderSummary({ subtotal, shipping, tax, total });
  }, [cartItems]);

  // Redirect if cart empty
  useEffect(() => {
    if (cartItems.length === 0) navigate("/cart");
  }, [cartItems, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name])
      setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate payment

      const orderData = {
        items: cartItems,
        billingInfo: formData,
        paymentMethod,
        orderSummary,
        orderDate: new Date().toISOString(),
        orderId: `ORD-${Date.now()}`,
      };

      completePayment(orderData);

      navigate("/payment-success", { state: { orderData } });
    } catch (err) {
      alert("Payment failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0)
    return (
      <div className="payment-container">
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate("/products")}>Go to Products</button>
      </div>
    );

  return (
    <div className="payment-container">
      <div className="payment-content">
        {/* Order Summary */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <img src={item.image || "/api/placeholder/60/60"} alt={item.name} />
              <div>
                <p>{item.name}</p>
                <p>Qty: {item.quantity || 1}</p>
              </div>
              <div>${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</div>
            </div>
          ))}
          <div className="totals">
            <p>Subtotal: ${orderSummary.subtotal.toFixed(2)}</p>
            <p>Shipping: {orderSummary.shipping === 0 ? "Free" : `$${orderSummary.shipping.toFixed(2)}`}</p>
            <p>Tax: ${orderSummary.tax.toFixed(2)}</p>
            <p>Total: ${orderSummary.total.toFixed(2)}</p>
          </div>
        </div>

        {/* Payment Form */}
        <div className="payment-form">
          <h3>Payment Information</h3>

          <div className="payment-methods">
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === "card"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Credit/Debit Card
            </label>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="paypal"
                checked={paymentMethod === "paypal"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              PayPal
            </label>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="apple"
                checked={paymentMethod === "apple"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Apple Pay
            </label>
          </div>

          <div className="form-group">
            <label>First Name</label>
            <input name="firstName" value={formData.firstName} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input name="lastName" value={formData.lastName} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" value={formData.email} onChange={handleInputChange} />
          </div>

          <div className="payment-actions">
            <button onClick={handlePayment} disabled={isProcessing}>
              {isProcessing ? "Processing..." : `Pay $${orderSummary.total.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
