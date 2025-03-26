import {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../src/styles/login.css'

function App() {
  // const navigate = useNavigate();
  const [Email, setEmail] = useState('')
  const [Password, setPassword] = useState('')


  return (
    <div className='page'>
      <div className="form">
        <h1>Login User</h1>
        <form>
          <input value = {Email} onChange = {(e)=>setEmail(e.target.value)} type="email" placeholder ="Email" /> <br />
          <input value = {Password} onChange = {(e)=>setPassword(e.target.value)} type="password" placeholder ="Password"/> <br />
          <input className = "btn" type="submit" value="Login" />
        </form>
        {/* This link is for Forgot Password */}
        <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
        {/* This link is for redirecting to the Register page */}
        <p className="message">
          Don't have an account? <Link to="/register">Create an account</Link>
        </p>
        
      </div>
    </div>
  );
}

export default App;
