// src/components/Auth.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/auth.css';

export default function Auth() {
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();

  // URL params
  const aliasPath = searchParams.get('aliasPath') || '';
  const reason    = searchParams.get('reason')    || '';
  const required  = searchParams.get('required')  || '';

  const requiresLocation = required.includes('loc');
  const requiresPassword = required.includes('pass');

  // Show appropriate error message if we got here via a “reason” query
  useEffect(() => {
    if (!reason) return;
    if (requiresPassword && !requiresLocation) {
      setError('Incorrect password. Please try again.');
    } else if (requiresLocation && !requiresPassword) {
      setError('You are outside the permitted location area.');
    } else {
      setError('Either the password is incorrect or you are outside the permitted area.');
    }
  }, [reason, requiresPassword, requiresLocation]);

  // Auto‑ask for location if that’s the only thing required
  useEffect(() => {
    if (requiresLocation && !requiresPassword && !location) {
      handleLocationRequest().catch(() => {});
    }
  }, [requiresLocation, requiresPassword, location]);

  // Fallback: IP‑based lookup
  const getLocationByIP = async () => {
    const resp = await fetch('https://ipapi.co/json/');
    if (!resp.ok) throw new Error('IP lookup failed');
    const data = await resp.json();
    return {
      latitude:  data.latitude,
      longitude: data.longitude,
      accuracy:  5000,
    };
  };

  // Always returns a Promise so you can `await` it
  const handleLocationRequest = () => {
    return new Promise(async (resolve, reject) => {
      setLoading(true);
      setError('');

      const finish = ({ latitude, longitude, accuracy }) => {
        setLocation({ latitude, longitude, accuracy });
        setLoading(false);
        resolve();
      };

      const fail = msg => {
        setError(msg);
        setLoading(false);
        reject(new Error(msg));
      };

      // 1) Native Geolocation
      if (navigator.geolocation) {
        const opts = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };
        navigator.geolocation.getCurrentPosition(
          pos => finish({ 
            latitude:  pos.coords.latitude, 
            longitude: pos.coords.longitude, 
            accuracy:  pos.coords.accuracy 
          }),
          async err => {
            console.warn('Geolocation error:', err);
            if (err.code === err.PERMISSION_DENIED) {
              return fail('Location access was denied.');
            }
            if (err.code === err.POSITION_UNAVAILABLE || err.code === err.TIMEOUT) {
              // try low‑accuracy retry
              navigator.geolocation.getCurrentPosition(
                pos => finish({
                  latitude:  pos.coords.latitude,
                  longitude: pos.coords.longitude,
                  accuracy:  pos.coords.accuracy
                }),
                async retryErr => {
                  console.warn('Low‑accuracy retry failed:', retryErr);
                  // fallback to IP
                  try {
                    const ipLoc = await getLocationByIP();
                    finish(ipLoc);
                  } catch {
                    fail('Unable to determine location. Please check settings.');
                  }
                },
                { ...opts, enableHighAccuracy: false, timeout: 15000 }
              );
            } else {
              fail('An unknown geolocation error occurred.');
            }
          },
          opts
        );
      } else {
        // 2) Fallback to IP
        try {
          const ipLoc = await getLocationByIP();
          finish(ipLoc);
        } catch {
          fail('Geolocation unsupported and IP lookup failed.');
        }
      }
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (requiresLocation && !location) {
      try {
        await handleLocationRequest();
      } catch {
        return; // error state is already set
      }
    }

    setLoading(true);
    // build query
    const params = new URLSearchParams();
    if (requiresPassword) params.set('passcode', password);
    if (requiresLocation) {
      params.set('lat', location.latitude.toString());
      params.set('lon', location.longitude.toString());
    }

    window.location.href = `https://getmyuri.com/r/${aliasPath}${params.toString() ? '?' + params.toString() : ''}`;
  };

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
          {requiresPassword && (
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

          {requiresLocation && !location && (
            <div className="form-group">
              <button
                type="button"
                className="location-btn"
                onClick={handleLocationRequest}
                disabled={loading}
              >
                {loading ? 'Please wait…' : 'Allow Location Access'}
              </button>
            </div>
          )}

          {location && <div className="location-info">Location granted ✓</div>}

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="submit-btn"
            disabled={
              loading ||
              (requiresPassword && !password) ||
              (requiresLocation && !location)
            }
          >
            {loading ? 'Verifying…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
