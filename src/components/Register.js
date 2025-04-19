import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/login.css';

function Register() {
  const [Email, setEmail] = useState('');
  const [Password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleForgotPassword = (e) => {
    e.preventDefault();
    // Do nothing as per requirement
  };

  return (
    <div className='login-container'>
      <div className="login-form">
        <h1>Get My Url</h1>
        <form>
          <div className="form-group">
            <label>Email</label>
            <input value={Email} onChange={(e) => setEmail(e.target.value)} type="email" />
          </div>
          <div className="form-group password-group">
            <label>Password</label>
            <div className="password-input-container">
              <input 
                value={Password} 
                onChange={(e) => setPassword(e.target.value)} 
                type={showPassword ? "text" : "password"}
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <button type="submit" className="login-button">
            Sign up
          </button>
        </form>
        <button onClick={handleForgotPassword} className="forgot-password">
          Forgot password?
        </button>
        <div className="create-account">
          <span>or </span>
          <Link to="/login">login</Link>
        </div>
      </div>
    </div>
  );
}

export default Register; 