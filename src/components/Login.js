import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/login.css';

function Login({ setIsLoggedIn }) {
  const [Email, setEmail] = useState('');
  const [Password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check for admin credentials
    if (Email === 'admin@gmail.com' && Password === 'admin') {
      // Store login state in localStorage
      localStorage.setItem('isLoggedIn', 'true');
      setIsLoggedIn(true);
      navigate('/'); // Redirect to home page after successful login
    } else {
      setError('Invalid email or password');
    }
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