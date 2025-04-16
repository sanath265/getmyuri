import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/auth.css';

function Auth() {
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [manualSuccess, setManualSuccess] = useState('');
  const [queryParams, setQueryParams] = useState({
    aliasPath: '',
    password_required: false,
    location_required: false
  });

  const navigate = useNavigate();
  const locationHook = useLocation();

  useEffect(() => {
    // Parse URL parameters
    const params = new URLSearchParams(locationHook.search);
    setQueryParams({
      aliasPath: params.get('aliasPath') || '',
      password_required: params.get('password_required') === 'true',
      location_required: params.get('location_required') === 'true'
    });
  }, [locationHook]);

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ latitude, longitude });
            resolve({ latitude, longitude });
          },
          (error) => {
            setError('Failed to get location. Please enable location access.');
            reject(error);
          }
        );
      } else {
        setError('Geolocation is not supported by your browser');
        reject(new Error('Geolocation not supported'));
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Build the URL with parameters
      let url = `https://www.getmyuri.com/r/${queryParams.aliasPath}`;
      const params = new URLSearchParams();

      // Add password if required
      if (queryParams.password_required && password) {
        params.append('passcode', password);
      }

      // Get location if required
      if (queryParams.location_required && !location) {
        try {
          const coords = await getLocation();
          params.append('lat', coords.latitude.toString());
          params.append('long', coords.longitude.toString());
        } catch (error) {
          setLoading(false);
          return; // Error message already set by getLocation
        }
      } else if (location) {
        params.append('lat', location.latitude.toString());
        params.append('long', location.longitude.toString());
      }

      // Add parameters to URL if any exist
      const paramString = params.toString();
      if (paramString) {
        url += '?' + paramString;
      }

      // Make the API call
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include' // Include cookies if needed
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to authenticate');
      }

      // Handle the redirect URL
      const redirectUrl = data.redirectUrl || url;
      
      // For external URLs, ensure HTTPS if possible
      if (redirectUrl.startsWith('http://')) {
        // Try to upgrade to HTTPS
        const httpsUrl = redirectUrl.replace('http://', 'https://');
        window.open(httpsUrl, '_blank');
      } else {
        window.open(redirectUrl, '_blank');
      }
      
      // Show success message in current window
      setManualSuccess('Link opened in new tab');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Authentication Required</h2>
        <form onSubmit={handleSubmit}>
          {queryParams.password_required && (
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
          )}

          {queryParams.location_required && !location && (
            <div className="form-group">
              <button
                type="button"
                className="location-btn"
                onClick={getLocation}
              >
                Allow Location Access
              </button>
            </div>
          )}

          {location && (
            <div className="location-info">
              Location access granted ✓
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
          {manualSuccess && <div className="success-message">{manualSuccess}</div>}

          <button
            type="submit"
            className="submit-btn"
            disabled={loading || 
              (queryParams.password_required && !password) || 
              (queryParams.location_required && !location)}
          >
            {loading ? 'Verifying...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Auth; 