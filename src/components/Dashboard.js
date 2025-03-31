import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';
import Toast from './Toast';

function Dashboard({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const [links] = useState([
    { url: 'getmyuri.com/myportfolio', views: 1 },
    { url: 'getmyuri.com/myportfolio', views: 5 },
    { url: 'getmyuri.com/myportfolio', views: 10 },
    { url: 'getmyuri.com/myportfolio', views: 3 }
  ]);
  const [showToast, setShowToast] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    navigate('/');
  };

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    setShowToast(true);
  };

  return (
    <div className="dashboard-container">
      {showToast && (
        <Toast 
          message="Link copied to clipboard!" 
          onClose={() => setShowToast(false)} 
        />
      )}
      <nav className="main-nav">
        <h1>Get My URL</h1>
        <div className="nav-links">
          <button onClick={() => navigate('/')} className="home-btn">
            Create Link
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Good Morning</h2>
          <h3>Admin</h3>
        </div>

        <div className="links-section">
          <h2>All Links</h2>
          <div className="links-list">
            {links.map((link, index) => (
              <div key={index} className="link-item">
                <div className="link-url">{link.url}</div>
                <div className="link-actions">
                  <button className="edit-btn" onClick={() => {}}>
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                  </button>
                  <button className="copy-btn" onClick={() => handleCopy(link.url)}>
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                    </svg>
                  </button>
                  <div className="views-count">
                    {link.views} views
                  </div>
                  <button className="options-btn">
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path fill="currentColor" d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 