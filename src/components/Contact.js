import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import '../styles/contact.css';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/images/logo.jpeg';

function Contact() {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    logout();
    navigate('/');
  };

  const validateName = (name) => {
    return /^[A-Za-z\s]{2,}$/.test(name);
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleFirstNameChange = (e) => {
    const value = e.target.value;
    setFirstName(value);
    if (!value.trim()) {
      setFormErrors(prev => ({ ...prev, firstName: 'First name is required' }));
    } else if (!validateName(value)) {
      setFormErrors(prev => ({ ...prev, firstName: 'Please enter a valid first name (minimum 2 characters)' }));
    } else {
      setFormErrors(prev => ({ ...prev, firstName: undefined }));
    }
  };

  const handleLastNameChange = (e) => {
    const value = e.target.value;
    setLastName(value);
    if (!value.trim()) {
      setFormErrors(prev => ({ ...prev, lastName: 'Last name is required' }));
    } else if (!validateName(value)) {
      setFormErrors(prev => ({ ...prev, lastName: 'Please enter a valid last name (minimum 2 characters)' }));
    } else {
      setFormErrors(prev => ({ ...prev, lastName: undefined }));
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (!value.trim()) {
      setFormErrors(prev => ({ ...prev, email: 'Email is required' }));
    } else if (!validateEmail(value)) {
      setFormErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
    } else {
      setFormErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const handleMessageChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    if (!value.trim()) {
      setFormErrors(prev => ({ ...prev, message: 'Message is required' }));
    } else if (value.length < 10) {
      setFormErrors(prev => ({ ...prev, message: 'Message must be at least 10 characters long' }));
    } else {
      setFormErrors(prev => ({ ...prev, message: undefined }));
    }
  };

  const isFormValid = () => {
    return (
      firstName.trim() &&
      lastName.trim() &&
      email.trim() &&
      message.trim() &&
      validateName(firstName) &&
      validateName(lastName) &&
      validateEmail(email) &&
      message.length >= 10 &&
      !Object.values(formErrors).some(error => error)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      // Validate all fields and show errors
      handleFirstNameChange({ target: { value: firstName } });
      handleLastNameChange({ target: { value: lastName } });
      handleEmailChange({ target: { value: email } });
      handleMessageChange({ target: { value: message } });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('');

    try {
      const templateParams = {
        from_name: `${firstName} ${lastName}`,
        from_email: email,
        message: message,
      };

      const response = await emailjs.send(
        'service_dp4satq',
        'template_c0vrjv9',
        templateParams,
        'heLUbLtK3YQlDhawm'
      );

      if (response.status === 200) {
        setSubmitStatus('success');
        // Reset form
        setFirstName('');
        setLastName('');
        setEmail('');
        setMessage('');
        setFormErrors({});
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-container">
      <nav className="main-nav">
        <div className="nav-left">
          <img src={logo} alt="GetMyUri" className="nav-logo" onClick={() => navigate('/')} />
        </div>
        <div className="nav-links">
          {isLoggedIn ? (
            <>
              <button className="nav-btn" onClick={() => navigate('/')}>Create Link</button>
              <button className="nav-btn" onClick={() => navigate('/dashboard')}>Dashboard</button>
              <button className="nav-btn logout-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button className="nav-btn" onClick={() => navigate('/')}>Home</button>
              <button className="nav-btn" onClick={() => navigate('/login')}>Login</button>
              <button className="nav-btn" onClick={() => navigate('/register')}>Register</button>
            </>
          )}
        </div>
      </nav>

      <div className="contact-content">
        <div className="contact-form-container">
          <h2>Contact us for queries</h2>
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={handleFirstNameChange}
                className={formErrors.firstName ? 'error' : ''}
                disabled={isSubmitting}
              />
              {formErrors.firstName && (
                <span className="error-message">{formErrors.firstName}</span>
              )}
            </div>
            
            <div className="form-group">
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={handleLastNameChange}
                className={formErrors.lastName ? 'error' : ''}
                disabled={isSubmitting}
              />
              {formErrors.lastName && (
                <span className="error-message">{formErrors.lastName}</span>
              )}
            </div>
            
            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
                className={formErrors.email ? 'error' : ''}
                disabled={isSubmitting}
              />
              {formErrors.email && (
                <span className="error-message">{formErrors.email}</span>
              )}
            </div>
            
            <div className="form-group">
              <textarea
                placeholder="Message"
                value={message}
                onChange={handleMessageChange}
                className={formErrors.message ? 'error' : ''}
                rows="5"
                disabled={isSubmitting}
              />
              {formErrors.message && (
                <span className="error-message">{formErrors.message}</span>
              )}
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting || !isFormValid()}
            >
              {isSubmitting ? 'Sending...' : 'Submit'}
            </button>
            
            {submitStatus === 'success' && (
              <p className="success-message">Thank you for your message! We'll get back to you soon.</p>
            )}
            {submitStatus === 'error' && (
              <p className="error-message">Sorry, there was an error sending your message. Please try again.</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Contact; 