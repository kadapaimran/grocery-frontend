import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';

// User components
import HomePage from './components/HomePage';
import AboutUs from './components/Aboutus';
import Login from './components/Login';
import Signup from './components/Signup';
import ProductPage from './components/ProductPage';
import Cart from './components/Cart';
import Payment from './components/Payment';
import Orders from './components/Orders';
import ProtectedRoute from './components/ProtectedRoute';
import PaymentSuccess from './components/PaymentSuccess';

// Admin components
import AdminLayout from './components/AdminLayout';
import Admin from './components/Admin';

function App() {
  return (
    <CartProvider>
      {/* Changed basename to /ecommerce */}
      <BrowserRouter basename="/ecommerce">
        <Routes>
          {/* ================= USER ROUTES ================= */}
          <Route path="/" element={<HomePage />}>
            <Route index element={<ProductPage />} />
            <Route path="about" element={<AboutUs />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="payment" element={<Payment />} />
            <Route path="payment-success" element={<PaymentSuccess />} />

            {/* Product categories (dynamic route) */}
            <Route path="categories/:category" element={<ProductPage />} />

            {/* Protected routes */}
            <Route
              path="cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* ================= ADMIN ROUTES ================= */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Admin />} />
            <Route path="products" element={<Admin />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
