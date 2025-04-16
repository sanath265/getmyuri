import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Circle, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import '../styles/customizeLink.css';
import { FaCopy, FaEllipsisV, FaEye, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

function MapComponent({ location, userLocation, setLocation }) {
  const map = useMap();
  
  useEffect(() => {
    if (location.position) {
      map.setView(location.position, 13);
    } else if (userLocation) {
      map.setView(userLocation, 13);
    }
  }, [map, location.position, userLocation]);

  return location.position ? (
    <>
      <Marker 
        position={location.position}
        draggable={true}
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target;
            const position = marker.getLatLng();
            setLocation(prev => ({
              ...prev,
              position: [position.lat, position.lng]
            }));
          },
        }}
      />
      <Circle
        center={location.position}
        radius={location.unit === 'miles' ? location.radius * 1609.34 : location.radius * 0.3048}
        pathOptions={{ color: '#E94444' }}
      />
    </>
  ) : null;
}

function StatsPanel() {
  const [activeOptionsIndex, setActiveOptionsIndex] = useState(null);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('http://www.getmyuri.com/api/links/click-stats?username=vijay');
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load stats');
        setStats([]);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const handleCopy = (alias) => {
    const url = `http://www.getmyuri.com/r/${alias}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const handleView = (alias) => {
    window.open(`https://getmyuri.com/r/${alias}`, '_blank');
  };

  const handleEdit = (alias) => {
    // Handle edit action
    console.log('Edit:', alias);
  };

  const handleDelete = (alias) => {
    // Handle delete action
    console.log('Delete:', alias);
  };

  const handleOptionsClick = (index) => {
    setActiveOptionsIndex(activeOptionsIndex === index ? null : index);
  };

  const handleBackdropClick = () => {
    setActiveOptionsIndex(null);
  };

  return (
    <div className="stats-container">
      {activeOptionsIndex !== null && (
        <div className="options-overlay-backdrop" onClick={handleBackdropClick} />
      )}
      {loading ? (
        <div className="stats-loading">Loading...</div>
      ) : error ? (
        <div className="stats-error">{error}</div>
      ) : stats.length === 0 ? (
        <div className="stats-empty">No links generated</div>
      ) : (
        stats.slice(0, 6).map((item, index) => (
          <div key={item.id} className="stats-item">
            <button 
              className="copy-btn" 
              onClick={() => handleCopy(item.alias)}
              title="Copy URL"
            >
              <FaCopy />
            </button>
            <span className="url">{`getmyuri.com/r/${item.alias}`}</span>
            <div className="views">
              <span className="views-count">{item.clickCount}</span>
              <span>views</span>
            </div>
            <button 
              className="options-btn" 
              title="More options"
              onClick={() => handleOptionsClick(index)}
            >
              <FaEllipsisV />
            </button>
            {activeOptionsIndex === index && (
              <div className="options-overlay">
                <button onClick={() => handleView(item.alias)}>
                  <FaEye />
                  View
                </button>
                <button onClick={() => handleEdit(item.alias)}>
                  <FaPencilAlt />
                  Edit
                </button>
                <button onClick={() => handleDelete(item.alias)}>
                  <FaTrash />
                  Delete
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

function CustomizeLink() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  // Mode state: 'automatic' or 'manual'
  const [mode, setMode] = useState('automatic');

  // Manual mode states (copied from Home.js logic)
  const [manualUrl, setManualUrl] = useState('');
  const [manualUrlError, setManualUrlError] = useState('');
  const [manualShortUrl, setManualShortUrl] = useState('');
  const [manualIsLoading, setManualIsLoading] = useState(false);

  const [linkDestination, setLinkDestination] = useState('');
  const [linkError, setLinkError] = useState('');
  const [aliases, setAliases] = useState(['']); // Array of aliases
  const [password, setPassword] = useState('');
  const [expirationHour, setExpirationHour] = useState('12');
  const [expirationMinute, setExpirationMinute] = useState('00');
  const [expirationAmPm, setExpirationAmPm] = useState('AM');
  const [expirationDate, setExpirationDate] = useState('');
  const [expirationError, setExpirationError] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [location, setLocation] = useState({
    enabled: false,
    position: null,
    radius: 1,
    unit: 'miles'
  });
  const [error, setError] = useState('');
  const [showLocationPermission, setShowLocationPermission] = useState(false);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState('prompt');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const validateExpirationDateTime = (date, hour, minute, ampm) => {
    if (!date) return '';

    // Get current time in MST using timezone string
    const now = new Date();
    const currentMST = new Date(now.toLocaleString('en-US', { timeZone: 'America/Denver' }));
    
    // Parse the input date string (which is in YYYY-MM-DD format)
    const [year, month, day] = date.split('-').map(Number);
    
    // Convert hour to 24-hour format
    let hours = parseInt(hour);
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    // Create expiration date in MST
    const expirationDate = new Date(year, month - 1, day, hours, parseInt(minute));
    const expirationMST = new Date(expirationDate.toLocaleString('en-US', { timeZone: 'America/Denver' }));
    
    // Compare timestamps
    if (expirationMST.getTime() <= currentMST.getTime()) {
      return 'Expiration date and time must be in the future (MST)';
    }
    
    return '';
  };

  const getCurrentTime = () => {
    // Get current time in MST using timezone string
    const now = new Date();
    const mstNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Denver' }));
    
    let hours = mstNow.getHours();
    let minutes = mstNow.getMinutes();
    let ampm = 'AM';

    // Convert to 12-hour format
    if (hours >= 12) {
      ampm = 'PM';
      hours = hours === 12 ? 12 : hours - 12;
    } else if (hours === 0) {
      hours = 12;
    }

    // No longer rounding to nearest 5 minutes
    return {
      hour: hours.toString().padStart(2, '0'),
      minute: minutes.toString().padStart(2, '0'),
      ampm
    };
  };

  const getMSTDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { timeZone: 'America/Denver' }).split('/').join('-');
  };

  useEffect(() => {
    // Set initial time to current time rounded to next 5 minutes
    const { hour, minute, ampm } = getCurrentTime();
    setExpirationHour(hour);
    setExpirationMinute(minute);
    setExpirationAmPm(ampm);

    // Check location permission status
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' })
        .then(result => {
          setLocationPermissionStatus(result.state);
          result.onchange = () => {
            setLocationPermissionStatus(result.state);
          };
        });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    logout();
    navigate('/');
  };

  const validateAlias = (value) => {
    if (value.length < 3) {
      return 'Alias must be at least 3 characters long';
    }
    if (['api', 'r', 'auth'].includes(value)) {
      return 'Cannot use restricted words: api, r, auth';
    }
    return '';
  };

  const handleAliasChange = (value, index) => {
    const validationError = validateAlias(value);
    const newAliases = [...aliases];
    newAliases[index] = value;
    setAliases(newAliases);
    setError(validationError);
  };

  const addAlias = () => {
    const lastAlias = aliases[aliases.length - 1];
    const validationError = validateAlias(lastAlias);
    if (!validationError) {
      setAliases([...aliases, '']);
      setError('');
    } else {
      setError('Please fix the current alias before adding a new one');
    }
  };

  const removeAlias = (index) => {
    if (aliases.length > 1) {
      const newAliases = aliases.filter((_, i) => i !== index);
      setAliases(newAliases);
      setError('');
    }
  };

  const handleLocationToggle = () => {
    if (locationPermissionStatus === 'denied') {
      alert('Please enable location access in your browser settings to use this feature.');
      return;
    }

    setIsLoadingLocation(true);
    if (!userLocation && locationPermissionStatus === 'prompt') {
      setShowLocationPermission(true);
    } else {
      handleGetUserLocation();
    }
  };

  const handleGetUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setLocation(prev => ({
            ...prev,
            position: [latitude, longitude]
          }));
          setShowLocationPermission(false);
          setShowLocationModal(true);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setShowLocationPermission(false);
          setShowLocationModal(true);
          setIsLoadingLocation(false);
        }
      );
    }
  };

  const validateUrl = (url) => {
    // If URL starts with www. or doesn't have a protocol, add https://
    let urlToCheck = url;
    if (url.startsWith('www.')) {
      urlToCheck = 'https://' + url;
    } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
      urlToCheck = 'https://' + url;
    }

    try {
      const urlObj = new URL(urlToCheck);
      return {
        isValid: true,
        normalizedUrl: urlToCheck
      };
    } catch {
      return {
        isValid: false,
        normalizedUrl: url
      };
    }
  };

  const handleLinkDestinationChange = (value) => {
    const { isValid, normalizedUrl } = validateUrl(value);
    if (value && !isValid) {
      setLinkError('Please enter a valid URL (e.g., www.example.com or https://example.com)');
      setLinkDestination(value);
    } else {
      setLinkError('');
      setLinkDestination(normalizedUrl);
    }
  };

  const handleExpirationDateChange = (value) => {
    setExpirationDate(value);
    const error = validateExpirationDateTime(value, expirationHour, expirationMinute, expirationAmPm);
    setExpirationError(error);
  };

  const handleExpirationTimeChange = (type, value) => {
    switch (type) {
      case 'hour':
        setExpirationHour(value);
        break;
      case 'minute':
        setExpirationMinute(value);
        break;
      case 'ampm':
        setExpirationAmPm(value);
        break;
      default:
        return;
    }
    
    const error = validateExpirationDateTime(expirationDate, 
      type === 'hour' ? value : expirationHour,
      type === 'minute' ? value : expirationMinute,
      type === 'ampm' ? value : expirationAmPm
    );
    setExpirationError(error);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  // Manual mode helpers
  const normalizeUrl = (url) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  };
  const isValidUrl = (url) => {
    try {
      new URL(normalizeUrl(url));
      return true;
    } catch (e) {
      return false;
    }
  };
  const handleManualGenerateLink = async (e) => {
    e.preventDefault();
    setManualUrlError('');
    setManualShortUrl('');
    if (!manualUrl.trim()) {
      setManualUrlError('Please enter a URL');
      return;
    }
    if (!isValidUrl(manualUrl)) {
      setManualUrlError('Please enter a valid URL');
      return;
    }
    setManualIsLoading(true);
    try {
      const normalized = normalizeUrl(manualUrl);
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
      setManualShortUrl(`http://www.getmyuri.com/r/${data.shortUrl}`);
    } catch (err) {
      setManualUrlError('Failed to shorten URL. Please try again.');
      console.error('Error:', err);
    } finally {
      setManualIsLoading(false);
    }
  };
  const handleManualCopy = () => {
    navigator.clipboard.writeText(manualShortUrl);
    toast.success('Link copied to clipboard!', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  return (
    <div className="app-container">
      <nav className="main-nav">
        <span className="brand-title">
          <span className="brand-get">GET</span>
          <span className="brand-myurl">MYURI</span>
        </span>
        <div className="nav-links">
          <button className="contact-btn" onClick={() => navigate('/contact')}>Contact Us</button>
          <button className="dashboard-btn" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <div className="content-container" style={{ background: '#fff', minHeight: '100vh', paddingBottom: '2rem' }}>
        <div className="customize-container" style={{ background: '#fff', boxShadow: 'none', marginBottom: 0 }}>
          {/* Mode Toggle */}
          <div className="mode-toggle">
            <button
              type="button"
              className={`mode-pill${mode === 'manual' ? ' selected' : ''}`}
              onClick={() => setMode('manual')}
            >
              Manual
            </button>
            <button
              type="button"
              className={`mode-pill${mode === 'automatic' ? ' selected' : ''}`}
              onClick={() => setMode('automatic')}
            >
              Automatic
            </button>
          </div>

          {/* Conditional UI */}
          {mode === 'manual' ? (
            // Manual mode: advanced CustomizeLink UI
            <div className="customize-form" style={{ background: '#fff' }}>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Link Destination</label>
                  <input
                    type="url"
                    value={linkDestination}
                    onChange={(e) => handleLinkDestinationChange(e.target.value)}
                    placeholder="Enter URL (e.g., https://example.com)"
                    required
                    className={linkError ? 'error-input' : ''}
                  />
                  {linkError && <div className="error-message">{linkError}</div>}
                </div>

                <div className="form-group">
                  <label>Custom Alias</label>
                  <div className="alias-container">
                    <div className="base-url">
                      <input
                        type="text"
                        value="getmyuri.com/r"
                        disabled
                        className="base-url-input"
                      />
                    </div>
                    {aliases.map((alias, index) => (
                      <div key={index} className="alias-input-wrapper">
                        <input
                          type="text"
                          value={alias}
                          onChange={(e) => handleAliasChange(e.target.value, index)}
                          placeholder="Enter alias (min. 3 characters)"
                          className="alias-input"
                        />
                        {index === aliases.length - 1 ? (
                          <button
                            type="button"
                            className="add-alias-btn"
                            onClick={addAlias}
                            disabled={!!error || !alias}
                          >
                            +
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="remove-alias-btn"
                            onClick={() => removeAlias(index)}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {error && <div className="error-message">{error}</div>}
                </div>

                <div className="form-group">
                  <label>Password (Optional)</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set password for link"
                  />
                </div>

                <div className="form-group">
                  <label>Expiration (MST)</label>
                  <div className="expiration-inputs">
                    <input
                      type="date"
                      value={expirationDate}
                      onChange={(e) => handleExpirationDateChange(e.target.value)}
                      min={getMSTDate()}
                      className={expirationError ? 'error-input' : ''}
                    />
                    <div className="time-picker">
                      <div className="clock-face">
                        <select 
                          value={expirationHour} 
                          onChange={(e) => handleExpirationTimeChange('hour', e.target.value)}
                          className={expirationError ? 'error-input' : ''}
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                            <option key={hour} value={hour.toString().padStart(2, '0')}>
                              {hour.toString().padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                        <span className="time-separator">:</span>
                        <select 
                          value={expirationMinute} 
                          onChange={(e) => handleExpirationTimeChange('minute', e.target.value)}
                          className={expirationError ? 'error-input' : ''}
                        >
                          {Array.from({ length: 60 }, (_, i) => i).map(minute => (
                            <option key={minute} value={minute.toString().padStart(2, '0')}>
                              {minute.toString().padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                        <select 
                          value={expirationAmPm} 
                          onChange={(e) => handleExpirationTimeChange('ampm', e.target.value)}
                          className={expirationError ? 'error-input' : ''}
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  {expirationError && <div className="error-message">{expirationError}</div>}
                </div>

                <div className="form-group">
                  <label>Location Restriction</label>
                  {location.enabled ? (
                    <div className="location-info">
                      <p>Location: {location.position[0].toFixed(6)}°, {location.position[1].toFixed(6)}°</p>
                      <p>Radius: {location.radius} {location.unit}</p>
                      <button
                        type="button"
                        className="edit-location-btn"
                        onClick={() => setShowLocationModal(true)}
                      >
                        Edit Location
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="location-btn"
                      onClick={handleLocationToggle}
                      disabled={isLoadingLocation}
                    >
                      <div className="button-content">
                        {isLoadingLocation && <div className="loader" />}
                        <span>{isLoadingLocation ? 'Getting Location...' : 'Set Location'}</span>
                      </div>
                    </button>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="generate-btn"
                  disabled={!!linkError || !linkDestination || !!expirationError}
                >
                  Generate Link
                </button>
              </form>
            </div>
          ) : (
            // Automatic mode: Home-like URL shortener
            <>
              <div className="url-shortener manual-wide manual-top-spacing">
                <form onSubmit={handleManualGenerateLink} className="url-input-container">
                  <input
                    type="text"
                    placeholder="Enter link here ..."
                    value={manualUrl}
                    onChange={e => setManualUrl(e.target.value)}
                    className={`url-input ${manualUrlError ? 'error' : ''}`}
                  />
                  {manualUrlError && <span className="error-message">{manualUrlError}</span>}
                  <button type="submit" className="generate-button" disabled={manualIsLoading}>
                    {manualIsLoading ? 'Generating...' : 'Generate Link'}
                  </button>
                </form>
                {manualShortUrl && (
                  <div className="short-url-container">
                    <div className="short-url-box">
                      <span className="short-url highlight-url">{manualShortUrl}</span>
                      <button className="copy-btn" onClick={handleManualCopy} aria-label="Copy URL">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="9" y="9" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
                          <rect x="5" y="5" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <StatsPanel />
            </>
          )}
        </div>
        {mode === 'manual' && <StatsPanel />}
      </div>

      {showLocationPermission && locationPermissionStatus === 'prompt' && (
        <div className="location-modal">
          <div className="modal-content">
            <h3>Location Access</h3>
            <p>We need your permission to access your location. This will help us set the center point for the restricted area.</p>
            <div className="modal-buttons">
              <button onClick={handleGetUserLocation} className="save-btn">
                Allow Location Access
              </button>
              <button onClick={() => {
                setShowLocationPermission(false);
                setShowLocationModal(true);
              }} className="cancel-btn">
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {showLocationModal && (
        <div className="location-modal">
          <div className="modal-content map-modal">
            <h3>Set Location Restrictions</h3>
            <div className="map-container">
              <MapContainer
                center={location.position || userLocation || [0, 0]}
                zoom={13}
                style={{ height: '300px', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapComponent 
                  location={location}
                  userLocation={userLocation}
                  setLocation={setLocation}
                />
              </MapContainer>
            </div>
            <div className="radius-control">
              <label>Radius: {location.radius} {location.unit}</label>
              <input
                type="range"
                min="0.1"
                max={location.unit === 'miles' ? "50" : "5280"}
                step="0.1"
                value={location.radius}
                onChange={(e) => setLocation(prev => ({
                  ...prev,
                  radius: parseFloat(e.target.value)
                }))}
              />
              <select
                value={location.unit}
                onChange={(e) => setLocation(prev => ({
                  ...prev,
                  unit: e.target.value,
                  radius: e.target.value === 'miles' ? 1 : 5280
                }))}
              >
                <option value="miles">Miles</option>
                <option value="feet">Feet</option>
              </select>
            </div>
            <div className="modal-buttons">
              <button
                onClick={() => {
                  setLocation(prev => ({ ...prev, enabled: true }));
                  setShowLocationModal(false);
                }}
                className="save-btn"
              >
                Save
              </button>
              <button
                onClick={() => setShowLocationModal(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomizeLink; 