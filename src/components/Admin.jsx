import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Admin.css";

const BASE_URL = "http://localhost:9090/springapp1/api/products";
const DEFAULT_IMAGE = "https://th.bing.com/th/id/OIP.wPjOsacGuRUjiOEUJmhRDgHaHa?w=179&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3";

const Admin = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", category: "", price: 0, imagePath: "" });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = async () => {
    setIsFetching(true);
    try {
      const res = await axios.get(BASE_URL);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch products");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    window.dispatchEvent(new Event("storage"));
    navigate("/login");
  };

  const resetForm = () => {
    setForm({ name: "", category: "", price: 0, imagePath: "" });
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      if (editId) {
        // Optimistic update
        setProducts(products.map(p => (p.id === editId ? { ...p, ...form } : p)));
        await axios.put(`${BASE_URL}/${editId}`, form);
        setSuccess("Product updated successfully");
      } else {
        const res = await axios.post(BASE_URL, form);
        // Optimistic update
        setProducts([...products, res.data]);
        setSuccess("Product added successfully");
      }
      resetForm();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to save product");
      fetchProducts(); // Re-sync with server if error occurs
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      imagePath: product.imagePath,
    });
    setEditId(product.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    // Optimistic removal
    const originalProducts = [...products];
    setProducts(products.filter(p => p.id !== id));

    try {
      await axios.delete(`${BASE_URL}/${id}`);
      setSuccess("Product deleted successfully");
    } catch (err) {
      console.error(err);
      setError("Failed to delete product");
      setProducts(originalProducts); // Revert if error
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      {isFetching && <p className="loading">Loading products...</p>}

      <form onSubmit={handleSubmit} className="admin-form">
        <label>Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <label>Category</label>
        <input
          type="text"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
        />

        <label>Price</label>
        <input
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
          required
        />

        <label>Image URL</label>
        <input
          type="text"
          value={form.imagePath}
          onChange={(e) => setForm({ ...form, imagePath: e.target.value })}
        />

        <div className="form-actions">
          <button type="submit" disabled={isSubmitting}>
            {editId ? "Update Product" : "Add Product"}
          </button>
          {editId && (
            <button type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>
                <img
                  src={p.imagePath || DEFAULT_IMAGE}
                  alt={p.name}
                  width={80}
                  height={80}
                  onError={(e) => (e.target.src = DEFAULT_IMAGE)}
                />
              </td>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>{formatPrice(p.price)}</td>
              <td>
                <button className="edit-btn" onClick={() => handleEdit(p)}>✏️</button>
                <button className="delete-btn" onClick={() => handleDelete(p.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Admin;
