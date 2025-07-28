import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

export default function Signup() {
  const [form, setForm] = useState({
    username: "", 
    displayName: "", 
    email: "", 
    password: "", 
    confirmPassword: ""
  });
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }
    
    setLoading(true);
    setError("");

    try {
      const { confirmPassword, ...signupData } = form;
      const response = await signup(signupData);
      console.log('Signup successful:', response);
      navigate("/home");
    } catch (err) {
      setError(err.message || "Signup failed");
      console.error('Signup error:', err);
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
              <p className="login-subtitle">Create your account</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username" className="input-label">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              className="login-input"
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="displayName" className="input-label">Display Name</label>
            <input
              id="displayName"
              type="text"
              name="displayName"
              placeholder="Enter your display name"
              value={form.displayName}
              onChange={handleChange}
              className="login-input"
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="email" className="input-label">Email</label>
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
            <label htmlFor="password" className="input-label">Password</label>
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
          
          <div className="input-group">
            <label htmlFor="confirmPassword" className="input-label">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={form.confirmPassword}
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
          
          <div className="login-footer">
            <p className="signup-text">
              Already have an account? 
              <Link to="/signin" className="signup-link">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}