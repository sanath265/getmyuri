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
      fetchLocation().catch(err => {
        setError('Please allow location access to continue');
      });
    }
  }, [locationRequired, passwordRequired]);

  const fetchLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error('Geolocation not supported'));
      }
      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } }) => {
          setCoords({ lat: latitude, long: longitude });
          resolve({ lat: latitude, long: longitude });
        },
        err => reject(err),
      );
    });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // 1. If location is required but not yet fetched, get it now
      if (locationRequired && !coords) {
        await fetchLocation().catch(err => {
          throw new Error('Unable to get location. Please allow access.');
        });
      }

      // 2. Build query string
      const params = new URLSearchParams();
      if (passwordRequired) params.set('passcode', password);
      if (locationRequired && coords) {
        params.set('lat',  coords.lat.toString());
        params.set('long', coords.long.toString());
      }

      // 3. Call your auth endpoint
      const apiUrl = `http://www.getmyuri.com/r/${aliasPath}${params.toString() ? '?' + params.toString() : ''}`;
      console.log('API URL:', apiUrl);
      
      const res = await fetch(apiUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Authentication failed');
      }

      // 4. Redirect (internal vs external)
      const data = await res.json();
      const redirectUrl = data.redirectUrl || apiUrl;
      const isExternal  = /^https?:\/\//.test(redirectUrl);
      
      if (isExternal) {
        window.location.href = redirectUrl;
      } else {
        navigate(redirectUrl, { replace: true });
      }

      setSuccess('Link opened successfully.');
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
                onClick={() => fetchLocation().catch(err => setError(err.message))}
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
