import { useState } from 'react';
import { Link } from 'react-router-dom';
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle contact form submission
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
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <textarea
                placeholder="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button type="submit" className="submit-button">
                Submit
              </button>
            </form>
          </div>
        </div>

        <div className="right-section">
          <div className="carousel-container">
            <div className="carousel-content">
              <div className="carousel-slide">
                <h2>Track Your Link Performance</h2>
                <p>Get insights into your URLs with real-time analytics. Monitor clicks, locations, and referral sources effortlessly.</p>
                <img src="/analytics-illustration.svg" alt="Analytics Dashboard" className="carousel-image" />
              </div>
            </div>
            <div className="carousel-dots">
              {[0, 1, 2, 3, 4].map((index) => (
                <button
                  key={index}
                  className={`carousel-dot ${currentSlide === index ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
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