import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../styles/dashboard.css';
import Toast from './Toast';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [selectedLink, setSelectedLink] = useState(null);
  const [sortBy, setSortBy] = useState('views-high'); // 'views-high', 'views-low', 'date'

  useEffect(() => {
    async function fetchClickStats() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('https://getmyuri.com/api/links/click-stats?username=admin');
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setLinks(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load click stats');
        setLinks([]);
      } finally {
        setLoading(false);
      }
    }
    fetchClickStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    logout();
    navigate('/');
  };

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    setShowToast(true);
  };

  const handleBarClick = (data) => {
    if (data && data.activePayload) {
      const clickedLink = data.activePayload[0].payload;
      setSelectedLink(clickedLink);
    }
  };

  const getSortedData = () => {
    let sortedLinks = [...links];
    switch (sortBy) {
      case 'views-high':
        sortedLinks.sort((a, b) => b.clickCount - a.clickCount);
        break;
      case 'views-low':
        sortedLinks.sort((a, b) => a.clickCount - b.clickCount);
        break;
      case 'date':
        sortedLinks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }
    return sortedLinks.map(link => ({
      name: link.alias,
      views: link.clickCount,
      fullUrl: `https://getmyuri.com/r/${link.alias}`,
      createdAt: link.createdAt
    }));
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-views">{`${payload[0].value} views`}</p>
        </div>
      );
    }
    return null;
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
        <span className="brand-title">
          <span className="brand-get">Get</span>
          <span className="brand-myurl">MyUri</span>
        </span>
        <div className="nav-links">
          <button className="dashboard-btn" onClick={() => navigate('/')}>Create Link</button>
          <button className="contact-btn" onClick={() => navigate('/contact')}>Contact Us</button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-section animate-fade-in">
          <h2>Welcome Admin</h2>
        </div>

        <div className="view-toggle animate-fade-in">
          <button 
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            List View
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'graph' ? 'active' : ''}`}
            onClick={() => setViewMode('graph')}
          >
            Graph View
          </button>
        </div>

        {viewMode === 'graph' && (
          <div className="sort-options animate-fade-in">
            <select 
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="views-high">Sort by Views (High to Low)</option>
              <option value="views-low">Sort by Views (Low to High)</option>
              <option value="date">Sort by Latest Created</option>
            </select>
          </div>
        )}

        <div className="links-section animate-slide-up">
          <h2>{viewMode === 'list' ? 'All Links' : 'Link Analytics'}</h2>
          
          {loading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              <span>Loading your links...</span>
            </div>
          ) : error ? (
            <div className="error">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          ) : links.length === 0 ? (
            <div className="no-links">
              <span className="no-links-icon">🔗</span>
              <p>No links generated yet</p>
              <button className="create-first-link" onClick={() => navigate('/')}>
                Create Your First Link
              </button>
            </div>
          ) : viewMode === 'graph' ? (
            <div className="graph-container">
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={getSortedData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    onClick={handleBarClick}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis hide />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="views" 
                      fill="#E94444"
                      radius={[4, 4, 0, 0]}
                      animationDuration={500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {selectedLink && (
                <div className="selected-link animate-fade-in">
                  <div className="selected-link-content">
                    <div className="link-url">getmyuri.com/r/{selectedLink.name}</div>
                    <div className="link-actions">
                      <button 
                        className="copy-btn" 
                        onClick={() => handleCopy(selectedLink.fullUrl)}
                        title="Copy link"
                      >
                        <svg viewBox="0 0 24 24" width="18" height="18">
                          <path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                        </svg>
                      </button>
                      <div className="views-count">
                        <svg className="views-icon" viewBox="0 0 24 24" width="16" height="16">
                          <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                        {selectedLink.views} views
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="links-list">
              {getSortedData().map((link, index) => (
                <div key={index} className="link-item animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="link-url">getmyuri.com/r/{link.name}</div>
                  <div className="link-actions">
                    <button 
                      className="copy-btn" 
                      onClick={() => handleCopy(link.fullUrl)}
                      title="Copy link"
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                      </svg>
                    </button>
                    <div className="views-count">
                      <span className="views-icon">👁️</span>
                      {link.views} views
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 