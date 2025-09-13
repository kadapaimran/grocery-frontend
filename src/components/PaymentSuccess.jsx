import { useLocation, useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.orderData) {
    // If someone opens /payment-success directly
    navigate("/products");
    return null;
  }

  const { orderData } = state;

  return (
    <div>
      <h2>Payment Successful!</h2>
      <p>Order ID: {orderData.orderId}</p>
      <p>Total Paid: ${orderData.orderSummary.total.toFixed(2)}</p>
    </div>
  );
};

export default PaymentSuccess;
