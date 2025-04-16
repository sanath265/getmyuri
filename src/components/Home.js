import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/home.css';
import { copyToClipboard } from '../utils/clipboard';

function Home() {
  const { isLoggedIn } = useAuth();
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
  const [shortUrl, setShortUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // Helper to normalize URL
  const normalizeUrl = (url) => {
    if (!url) return 'http://';
    if (url.startsWith('https://')) {
      return 'http://' + url.substring(8);
    }
    if (!url.startsWith('http://')) {
      return 'http://' + url;
    }
    return url;
  };

  const isValidUrl = (url) => {
    // Validate the normalized URL
    try {
      new URL(normalizeUrl(url));
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleGenerateLink = async (e) => {
    e.preventDefault();
    setUrlError('');
    setShortUrl('');

    if (!url.trim()) {
      setUrlError('Please enter a URL');
      return;
    }

    if (!isValidUrl(url)) {
      setUrlError('Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    try {
      const normalized = normalizeUrl(url);
      const response = await fetch('http://www.getmyuri.com/api/default/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ link: normalized }),
      });

      if (!response.ok) {
        throw new Error('Failed to shorten URL');
      }

      const data = await response.json();
      setShortUrl(`http://www.getmyuri.com/r/${data.shortUrl}`);
      setShowPopup(true);
    } catch (err) {
      setUrlError('Failed to shorten URL. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(shortUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Link copied to clipboard!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } else {
      toast.error('Failed to copy link', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleContinueWithoutSignIn = () => {
    setShowPopup(false);
  };

  const validateName = (name) => {
    return /^[A-Za-z\s]+$/.test(name);
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

  return (
    <div className="home-container">
      <nav className="navbar">
        <span className="brand-title">
          <span className="brand-get">GET</span>
          <span className="brand-myurl">MYURI</span>
        </span>
        {isLoggedIn ? (
          <div className="nav-links">
            <Link to="/customize" className="nav-btn">Create Link</Link>
            <Link to="/dashboard" className="nav-btn">Dashboard</Link>
            <Link to="/logout" className="nav-btn logout-btn">Logout</Link>
          </div>
        ) : (
          <Link to="/login" className="sign-in-button">Sign in</Link>
        )}
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
              <button onClick={handleGenerateLink} className="generate-button" disabled={isLoading}>
                {isLoading ? 'Generating...' : 'Generate Link'}
              </button>
            </div>
            {shortUrl && (
              <div className="short-url-container">
                <div className="short-url-box">
                  <span className="short-url highlight-url">{shortUrl}</span>
                  <button className="copy-btn" onClick={handleCopy} aria-label="Copy URL">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="9" y="9" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <rect x="5" y="5" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="contact-section">
            <h2>Contact us for queries</h2>
            <form className="contact-form">
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