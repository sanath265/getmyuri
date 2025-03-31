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
import Toast from './Toast';

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
  const [showToast, setShowToast] = useState(false);
  
  // Limit to 6 items
  const mockData = [
    { url: 'getmyuri.com/myportfolio', views: 1 },
    { url: 'getmyuri.com/myresume', views: 5 },
    { url: 'getmyuri.com/myblog', views: 10 },
    { url: 'getmyuri.com/myprojects', views: 3 },
    { url: 'getmyuri.com/mycontact', views: 7 },
    { url: 'getmyuri.com/mylinks', views: 2 }
  ];

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    setShowToast(true);
  };

  const handleView = (url) => {
    window.open(`https://${url}`, '_blank');
  };

  const handleEdit = (url) => {
    // Handle edit action
    console.log('Edit:', url);
  };

  const handleDelete = (url) => {
    // Handle delete action
    console.log('Delete:', url);
  };

  const handleOptionsClick = (index) => {
    setActiveOptionsIndex(activeOptionsIndex === index ? null : index);
  };

  const handleBackdropClick = () => {
    setActiveOptionsIndex(null);
  };

  return (
    <div className="stats-container">
      {showToast && (
        <Toast 
          message="Link copied to clipboard!" 
          onClose={() => setShowToast(false)} 
        />
      )}
      {activeOptionsIndex !== null && (
        <div className="options-overlay-backdrop" onClick={handleBackdropClick} />
      )}
      {mockData.map((item, index) => (
        <div key={index} className="stats-item">
          <button 
            className="copy-btn" 
            onClick={() => handleCopy(item.url)}
            title="Copy URL"
          >
            <FaCopy />
          </button>
          <span className="url">{item.url}</span>
          <div className="views">
            <span className="views-count">{item.views}</span>
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
              <button onClick={() => handleView(item.url)}>
                <FaEye />
                View
              </button>
              <button onClick={() => handleEdit(item.url)}>
                <FaPencilAlt />
                Edit
              </button>
              <button onClick={() => handleDelete(item.url)}>
                <FaTrash />
                Delete
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function CustomizeLink({ setIsLoggedIn }) {
  const navigate = useNavigate();
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
    setIsLoggedIn(false);
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

  return (
    <div className="app-container">
      <nav className="main-nav">
        <h1>Get My URL</h1>
        <div className="nav-links">
          <button className="contact-btn" onClick={() => navigate('/contact')}>Contact Us</button>
          <button className="dashboard-btn" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <div className="content-container">
        <div className="customize-container">
          <div className="customize-form">
            <h2>Customize Link</h2>
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
        </div>
        <StatsPanel />
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