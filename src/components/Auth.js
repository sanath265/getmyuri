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

  // Auto‑request location if only location is required
  useEffect(() => {
    if (locationRequired && !passwordRequired && !coords) {
      handleLocationRequest().catch(err => {
        setError('Please allow location access to continue');
      });
    }
  }, [locationRequired, passwordRequired, coords]);

  const handleLocationRequest = async () => {
    if (!navigator.geolocation) {
      throw new Error('Your browser does not support location services. Please try using a different browser.');
    }

    try {
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
      console.log('Location permission status:', permissionStatus.state);
      
      if (permissionStatus.state === 'denied') {
        throw new Error('Location access is denied. Please enable location services in your browser settings and try again.');
      }

      return new Promise((resolve, reject) => {
        const options = {
          enableHighAccuracy: true, // Try high accuracy first
          timeout: 10000, // 10 seconds timeout
          maximumAge: 0
        };

        console.log('Requesting location with options:', options);
        
        navigator.geolocation.getCurrentPosition(
          position => {
            console.log('Location obtained:', position);
            const { latitude, longitude } = position.coords;
            setCoords({ lat: latitude, lon: longitude });
            resolve({ latitude, longitude });
          },
          error => {
            console.error('Location error details:', {
              code: error.code,
              message: error.message,
              PERMISSION_DENIED: error.PERMISSION_DENIED,
              POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
              TIMEOUT: error.TIMEOUT
            });

            // Try again with lower accuracy if high accuracy fails
            if (error.code === error.POSITION_UNAVAILABLE && options.enableHighAccuracy) {
              console.log('Retrying with lower accuracy...');
              options.enableHighAccuracy = false;
              navigator.geolocation.getCurrentPosition(
                position => {
                  console.log('Location obtained with lower accuracy:', position);
                  const { latitude, longitude } = position.coords;
                  setCoords({ lat: latitude, lon: longitude });
                  resolve({ latitude, longitude });
                },
                retryError => {
                  console.error('Retry location error:', retryError);
                  switch (retryError.code) {
                    case retryError.PERMISSION_DENIED:
                      reject(new Error('Location access is denied. Please enable location services in your browser settings and try again.'));
                      break;
                    case retryError.POSITION_UNAVAILABLE:
                      reject(new Error('Unable to get your location. Please check that:\n1. Location services are enabled on your device\n2. Your browser has permission to access location\n3. You are connected to the internet'));
                      break;
                    case retryError.TIMEOUT:
                      reject(new Error('Location request timed out. Please check your internet connection and try again.'));
                      break;
                    default:
                      reject(new Error('Unable to get your location. Please check your device settings and try again.'));
                  }
                },
                options
              );
            } else {
              switch (error.code) {
                case error.PERMISSION_DENIED:
                  reject(new Error('Location access is denied. Please enable location services in your browser settings and try again.'));
                  break;
                case error.POSITION_UNAVAILABLE:
                  reject(new Error('Unable to get your location. Please check that:\n1. Location services are enabled on your device\n2. Your browser has permission to access location\n3. You are connected to the internet'));
                  break;
                case error.TIMEOUT:
                  reject(new Error('Location request timed out. Please check your internet connection and try again.'));
                  break;
                default:
                  reject(new Error('Unable to get your location. Please check your device settings and try again.'));
              }
            }
          },
          options
        );
      });
    } catch (error) {
      console.error('Location request error:', error);
      throw error;
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 1) Build query params
    const params = new URLSearchParams();
    if (passwordRequired) {
      params.set('passcode', password);
    }
    if (locationRequired) {
      if (!coords) {
        try {
          await handleLocationRequest();
        } catch (err) {
          setError(err.message);
          setLoading(false);
          return;
        }
      }
      params.set('lat', coords.lat.toString());
      params.set('lon', coords.lon.toString());
    }

    // 2) Let the browser do a normal navigation (no fetch, no CORS)
    const authUrl = `https://getmyuri.com/r/${aliasPath}${params.toString() ? '?' + params.toString() : ''}`;
    window.location.href = authUrl;
  };

  // Show auth errors if redirected back with ?error=…
  useEffect(() => {
    const lastAuthAttempt = sessionStorage.getItem('lastAuthAttempt');
    if (lastAuthAttempt) {
      sessionStorage.removeItem('lastAuthAttempt');
      const errorParam = new URLSearchParams(window.location.search).get('error');
      if (errorParam) {
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
