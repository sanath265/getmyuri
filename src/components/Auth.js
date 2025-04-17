// src/components/Auth.js
import React, { useState } from 'react';
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

  const aliasPath        = searchParams.get('aliasPath')         || '';
  const passwordRequired = searchParams.get('password_required') === 'true';
  const locationRequired = searchParams.get('location_required') === 'true';

  const fetchLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error('Geolocation not supported'));
      }
      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } }) => {
          setCoords({ latitude, longitude });
          resolve({ latitude, longitude });
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
        params.set('lat',  coords.latitude.toString());
        params.set('long', coords.longitude.toString());
      }

      // 3. Call your auth endpoint
      const apiUrl = `https://www.getmyuri.com/r/${aliasPath}${params.toString() ? '?' + params.toString() : ''}`;
      const res    = await fetch(apiUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Authentication failed');

      // 4. Redirect (internal vs external)
      const redirectUrl = data.redirectUrl || apiUrl;
      const isExternal  = /^https?:\/\//.test(redirectUrl);
      if (isExternal) {
        window.open(redirectUrl.replace(/^http:\/\//, 'https://'), '_blank');
      } else {
        navigate(redirectUrl, { replace: true });
      }

      setSuccess('Link opened successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

          {error   && <div className="error-message">{error}</div>}
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
