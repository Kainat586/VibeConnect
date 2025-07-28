
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

export default function Signin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { signin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await signin(form);
      console.log('Signin successful:', response);
      navigate("/home");
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
      console.error('Signin error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="header-content">
            <div className="header-logo">
              <img src={logo} alt="VibeConnect Logo" className="logo-image" />
            </div>
            <div className="header-text">
              <h2 className="login-title">VibeConnect</h2>
              <p className="login-subtitle">Sign in to your account</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="email" className="input-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              className="login-input"
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password" className="input-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              className="login-input"
              required
            />
          </div>
          
          {error && (
            <div className="error-container">
              <p className="error-message">
                {error}
              </p>
            </div>
          )}
          
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          
          <div className="login-footer">
            <p className="signup-text">
              Don't have an account? 
              <Link to="/signup" className="signup-link">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}