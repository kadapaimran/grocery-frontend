import { useState } from "react";
import { login } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Auth/Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(""); // reset error
    try {
      const response = await login(username, password);

      // Save token and username (use entered username)
      if (response.token) localStorage.setItem("token", response.token);
      localStorage.setItem("username", username);
      localStorage.setItem("isAuthenticated", "true");

      // Trigger re-render in other components if needed
      window.dispatchEvent(new Event("storage"));

      // Redirect based on entered username
      if (username.toLowerCase().startsWith("ad")) {
        navigate("/admin");
      } else {
        navigate("/");
      }

    } catch (err) {
      // Show backend message if available
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Invalid credentials!");
      }
    }
  };

  return (
    <div className="center-layout">
      <div className="auth-container">
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
        {error && <p className="error-message">{error}</p>}
        <p>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
