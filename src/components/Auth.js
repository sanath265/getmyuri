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
      throw new Error('Geolocation is not supported by your browser');
    }
    const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
    if (permissionStatus.state === 'denied') {
      throw new Error('Location access is denied. Please enable it in your browser settings.');
    }
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, lon: longitude });
          resolve({ latitude, longitude });
        },
        error => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error('Location access is denied. Please enable it in your browser settings.'));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error('Location information is unavailable. Please enable device location services.'));
              break;
            case error.TIMEOUT:
              reject(new Error('Location request timed out. Please try again.'));
              break;
            default:
              reject(new Error('An unknown error occurred while getting location.'));
          }
        },
        { enableHighAccuracy: false, timeout: 30000, maximumAge: 0 }
      );
    });
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

    const authUrl = `https://getmyuri.com/r/${aliasPath}${params.toString() ? '?' + params.toString() : ''}`;

    try {
      // 2) Fetch & follow redirect automatically
      const resp = await fetch(authUrl, {
        method: 'GET',
        mode: 'cors',
        redirect: 'follow'
      });

      // 3) Navigate to the final URL
      window.location.href = resp.url;
    } catch (err) {
      console.error('Error during auth fetch:', err);
      setError(err.message);
      setLoading(false);
    }
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
