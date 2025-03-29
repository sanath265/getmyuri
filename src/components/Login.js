import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/login.css';

function Login() {
  const [Email, setEmail] = useState('');
  const [Password, setPassword] = useState('');

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
          <div className="form-group">
            <label>Password</label>
            <input value={Password} onChange={(e) => setPassword(e.target.value)} type="password" />
          </div>
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