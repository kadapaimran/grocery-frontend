import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { CartProvider } from './context/CartContext'   // ✅ import

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CartProvider>   {/* ✅ wrap App inside provider */}
      <App />
    </CartProvider>
  </React.StrictMode>,
)
