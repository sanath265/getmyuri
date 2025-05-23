import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/login.css';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [Email, setEmail] = useState('');
  const [Password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check for admin credentials
    if (Email === 'admin@gmail.com' && Password === 'admin') {
      // Store login state in localStorage
      localStorage.setItem('isLoggedIn', 'true');
      login();
      navigate('/'); // Redirect to home page after successful login
    } else {
      setError('Invalid email or password');
    }
  };

  const handleTestLogin = () => {
    // Set admin credentials
    setEmail('admin@gmail.com');
    setPassword('admin');
    // Store login state in localStorage
    localStorage.setItem('isLoggedIn', 'true');
    login();
    navigate('/'); // Redirect to home page after successful login
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    // Do nothing as per requirement
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className='login-container'>
      <div className="login-form">
        <h1>Get My URL</h1>
        <div className="test-login-message">
          <p>To test advanced features, click the button below to log in with admin credentials.</p>
          <button onClick={handleTestLogin} className="test-login-button">
            Test Login (admin@gmail.com)
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input 
              value={Email} 
              onChange={(e) => setEmail(e.target.value)} 
              type="email"
              required 
            />
          </div>
          <div className="form-group password-group">
            <label>Password</label>
            <div className="password-input-container">
              <input 
                value={Password} 
                onChange={(e) => setPassword(e.target.value)} 
                type={showPassword ? "text" : "password"}
                required 
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
        <button onClick={handleForgotPassword} className="forgot-password">
          Forgot password?
        </button>
        <div className="create-account">
          <span>or </span>
          <Link to="/register">create an account</Link>
        </div>
      </div>
    </div>
  );
}

export default Login; 