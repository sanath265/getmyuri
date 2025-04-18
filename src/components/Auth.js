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
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // 1. If location is required but not yet fetched, get it now
      if (locationRequired && !coords) {
        await handleLocationRequest().catch(err => {
          throw new Error('Unable to get location. Please allow access.');
        });
      }

      // 2. Build query string
      const params = new URLSearchParams();
      if (passwordRequired) params.set('passcode', password);
      if (locationRequired && coords) {
        params.set('lat', coords.lat.toString());
        params.set('lon', coords.lon.toString());
      }

      // 3. Build the redirect URL
      const redirectUrl = `https://getmyuri.com/r/${aliasPath}${params.toString() ? '?' + params.toString() : ''}`;
      
      // 4. Try to redirect and handle errors
      try {
        const response = await fetch(redirectUrl, { method: 'HEAD' });
        if (!response.ok) {
          if (response.status === 401) {
            if (passwordRequired && locationRequired) {
              throw new Error('Either you are outside the permitted location area or the password is incorrect.');
            } else if (passwordRequired) {
              throw new Error('Incorrect password. Please try again.');
            } else if (locationRequired) {
              throw new Error('You are outside the permitted location area. Please check your location.');
            }
          }
          throw new Error('Unauthorized access. Please check your credentials and location.');
        }
        // If the HEAD request succeeds, proceed with the redirect
        window.location.href = redirectUrl;
      } catch (err) {
        if (err.message.includes('password') || err.message.includes('location')) {
          throw err; // Re-throw specific error messages
        }
        throw new Error('Failed to verify access. Please try again.');
      }

    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

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

