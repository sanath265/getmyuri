import React, { useState } from 'react';
import './register.css';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add form validation or API calls here
    console.log('Registration details:', {
      firstName,
      lastName,
      email,
      confirmEmail,
      password,
      confirmPassword,
    });
  };

  return (
    <div className="page">
      <div className="form">
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="First Name" 
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          /><br />
          <input 
            type="text" 
            placeholder="Last Name" 
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          /><br />
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          /><br />
          <input 
            type="email" 
            placeholder="Confirm Email" 
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
          /><br />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          /><br />
          <input 
            type="password" 
            placeholder="Confirm Password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          /><br />
          <button className="btn" type="submit">Register</button>
        </form>
        <p className="message">
          Already have an account? <a href="#">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
