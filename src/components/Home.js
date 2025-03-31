import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import '../styles/home.css';

function Home() {
  const [url, setUrl] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [progress, setProgress] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState('');

  const slides = [
    {
      title: "Shorten Your URLs",
      description: "Create short, memorable links that are easy to share and track",
      image: "/shorten-illustration.svg"
    },
    {
      title: "Track Analytics",
      description: "Get insights into your link performance with detailed analytics",
      image: "/analytics-illustration.svg"
    },
    {
      title: "getmyuri.com/r/mybrand",
      description: "Customize your links with your own brand name",
      image: "/customize-illustration.svg"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          setCurrentSlide((prevSlide) => (prevSlide + 1) % 3);
          return 0;
        }
        return prevProgress + 1;
      });
    }, 50);

    return () => clearInterval(timer);
  }, []);

  const handleSlideClick = (index) => {
    setCurrentSlide(index);
    setProgress(0);
  };

  const isValidUrl = (urlString) => {
    try {
      new URL(urlString);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleGenerateLink = (e) => {
    e.preventDefault();
    setUrlError('');

    if (!url.trim()) {
      setUrlError('Please enter a URL');
      return;
    }

    if (!isValidUrl(url)) {
      setUrlError('Please enter a valid URL');
      return;
    }

    setShowPopup(true);
  };

  const handleContinueWithoutSignIn = () => {
    setShowPopup(false);
    // Handle URL shortening without sign in
  };

  const validateName = (name) => {
    return /^[A-Za-z\s]+$/.test(name);
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Real-time validation handlers
  const handleFirstNameChange = (e) => {
    const value = e.target.value;
    setFirstName(value);
    if (!value.trim()) {
      setFormErrors(prev => ({ ...prev, firstName: 'First name is required' }));
    } else if (!validateName(value)) {
      setFormErrors(prev => ({ ...prev, firstName: 'First name should only contain letters' }));
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
      setFormErrors(prev => ({ ...prev, lastName: 'Last name should only contain letters' }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if there are any errors
    if (Object.values(formErrors).some(error => error !== undefined)) {
      return;
    }

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
    }
  };

  return (
    <div className="home-container">
      <nav className="navbar">
        <h1>Get My Url</h1>
        <Link to="/login" className="sign-in-button">Sign in</Link>
      </nav>

      <div className="main-content">
        <div className="left-section">
          <div className="url-shortener">
            <div className="url-input-container">
              <input
                type="text"
                placeholder="Enter link here ..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={`url-input ${urlError ? 'error' : ''}`}
              />
              {urlError && <span className="error-message">{urlError}</span>}
              <button onClick={handleGenerateLink} className="generate-button">
                Generate Link
              </button>
            </div>
          </div>

          <div className="contact-section">
            <h2>Contact us for queries</h2>
            <form onSubmit={handleSubmit} className="contact-form">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={handleFirstNameChange}
                className={formErrors.firstName ? 'error' : ''}
              />
              {formErrors.firstName && (
                <span className="error-message">{formErrors.firstName}</span>
              )}
              
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={handleLastNameChange}
                className={formErrors.lastName ? 'error' : ''}
              />
              {formErrors.lastName && (
                <span className="error-message">{formErrors.lastName}</span>
              )}
              
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
                className={formErrors.email ? 'error' : ''}
              />
              {formErrors.email && (
                <span className="error-message">{formErrors.email}</span>
              )}
              
              <textarea
                placeholder="Message"
                value={message}
                onChange={handleMessageChange}
                className={formErrors.message ? 'error' : ''}
              />
              {formErrors.message && (
                <span className="error-message">{formErrors.message}</span>
              )}
              
              <button type="submit" className="submit-button">
                Submit
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

        <div className="right-section">
          <div className="carousel-container">
            <div className="carousel-content">
              <div 
                className={`carousel-slide ${currentSlide === 0 ? 'active' : ''}`}
                onClick={() => handleSlideClick(0)}
              >
                <h2>Track Your Link Performance</h2>
                <p>Get insights into your URLs with real-time analytics. Monitor clicks, locations, and referral sources effortlessly.</p>
                <img src="/analytics-illustration.svg" alt="Analytics Dashboard" className="carousel-image" />
              </div>
              <div 
                className={`carousel-slide ${currentSlide === 1 ? 'active' : ''}`}
                onClick={() => handleSlideClick(1)}
              >
                <h2>Secure Access to Your Links</h2>
                <p>Protect your URLs with password or location-based restrictions. Ensure only the right audience can access your content, exactly where and when you want.</p>
                <img src="/security-illustration.svg" alt="Secure Access" className="carousel-image" />
              </div>
              <div 
                className={`carousel-slide ${currentSlide === 2 ? 'active' : ''}`}
                onClick={() => handleSlideClick(2)}
              >
                <h2>Customize Your Links</h2>
                <p>Assign manual aliases to your shortened links for quick recognition and easy management. Keep your URLs clean, memorable, and on-brand.</p>
                <img src="/customize-illustration.svg" alt="Custom Links" className="carousel-image" />
              </div>
            </div>
            <div className="progress-bar">
              <div className="progress" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="carousel-dots">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  className={`carousel-dot ${currentSlide === index ? 'active' : ''}`}
                  onClick={() => handleSlideClick(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Want to customize your URL?</h2>
            <p>Sign in to our website to create personalized links with custom aliases instead of auto-generated ones.</p>
            <div className="popup-buttons">
              <Link to="/login" className="sign-in-btn">Sign in</Link>
              <button onClick={handleContinueWithoutSignIn} className="continue-btn">
                Continue without sign in
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home; 