// src/components/Auth.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/auth.css';

export default function Auth() {
  const [password, setPassword]       = useState('');
  const [coords, setCoords]           = useState(null);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [successMessage, setSuccess]  = useState('');

  const [searchParams] = useSearchParams();
  const navigate        = useNavigate();

  // Debug URL parameters
  useEffect(() => {
    console.log('URL Parameters:', {
      aliasPath: searchParams.get('aliasPath'),
      passwordRequired: searchParams.get('password_required'),
      locationRequired: searchParams.get('location_required')
    });
  }, [searchParams]);

  const aliasPath        = searchParams.get('aliasPath') || '';
  const passwordRequired = searchParams.get('password_required') === 'true';
  const locationRequired = searchParams.get('location_required') === 'true';

  useEffect(() => {
    // If only location is required, fetch it automatically
    if (locationRequired && !passwordRequired && !coords) {
      handleLocationRequest().catch(err => {
        setError('Please allow location access to continue');
      });
    }
  }, [locationRequired, passwordRequired]);

  const handleLocationRequest = async () => {
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      // First check if we have permission
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
      if (permissionStatus.state === 'denied') {
        throw new Error('Location access is denied. Please enable it in your browser settings.');
      }

      // Get location with a single attempt and longer timeout
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (error) => {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                reject(new Error('Location access is denied. Please enable it in your browser settings.'));
                break;
              case error.POSITION_UNAVAILABLE:
                reject(new Error('Location information is unavailable. Please ensure your device\'s location services are enabled.'));
                break;
              case error.TIMEOUT:
                reject(new Error('Location request timed out. Please try again.'));
                break;
              default:
                reject(new Error('An unknown error occurred while getting location.'));
            }
          },
          {
            enableHighAccuracy: false, // Start with lower accuracy
            timeout: 30000, // 30 seconds timeout
            maximumAge: 0
          }
        );
      });

      if (!position || !position.coords) {
        throw new Error('Could not get location coordinates. Please try again.');
      }

      // Set the coordinates in state
      setCoords({
        lat: position.coords.latitude,
        lon: position.coords.longitude
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

    } catch (error) {
      console.error('Location error:', error);
      throw error;
    }
  };

  const handleLocationBasedAuth = async () => {
    try {
      const location = await handleLocationRequest();
      // Use the location data in your auth flow
      console.log('Location obtained:', location);
      // ... rest of your auth logic
    } catch (error) {
      console.error('Auth location error:', error);
      // Handle the error appropriately in your UI
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    // … build `authUrl` with passcode/coords …
    const authUrl = `https://getmyuri.com/r/${aliasPath}?${params.toString()}`;
  
    try {
      // 1) perform a GET via fetch()
      const resp = await fetch(authUrl, {
        method: 'GET',
        mode: 'cors',                   // if cross‐subdomain
        credentials: 'include',         // if cookies/session needed
        redirect: 'manual'              // so fetch won’t auto‐follow
      });
  
      if (resp.status === 302) {
        // 2) grab the Location header and navigate
        const location = resp.headers.get('Location');
        window.location.href = location;
      } else {
        throw new Error('Access denied. Please check your password/location.');
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Add useEffect to check for auth errors when component mounts
  useEffect(() => {
    const lastAuthAttempt = sessionStorage.getItem('lastAuthAttempt');
    if (lastAuthAttempt) {
      sessionStorage.removeItem('lastAuthAttempt');
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get('error');
      
      if (error) {
        if (passwordRequired && locationRequired) {
          setError('Either you are outside the permitted location area or the password is incorrect.');
        } else if (passwordRequired) {
          setError('Incorrect password. Please try again.');
        } else if (locationRequired) {
          setError('You are outside the permitted location area. Please check your location.');
        } else {
          setError('Access denied. Please check your credentials.');
        }
      }
    }
  }, [passwordRequired, locationRequired]);

  // If no parameters are provided, show a message
  if (!aliasPath) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h2>Invalid Link</h2>
          <p>This link appears to be invalid or expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Authentication Required</h2>
        <form onSubmit={handleSubmit}>
          {passwordRequired && (
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
          )}

          {locationRequired && !coords && (
            <div className="form-group">
              <button
                type="button"
                className="location-btn"
                onClick={() => handleLocationRequest().catch(err => setError(err.message))}
                disabled={loading}
              >
                {loading ? 'Please wait…' : 'Allow Location Access'}
              </button>
            </div>
          )}

          {coords && <div className="location-info">Location access granted ✓</div>}

          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <button
            type="submit"
            className="submit-btn"
            disabled={
              loading ||
              (passwordRequired && !password) ||
              (locationRequired && !coords)
            }
          >
            {loading ? 'Verifying…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}

