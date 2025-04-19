// src/components/Auth.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/auth.css';

export default function Auth() {
  const [password, setPassword] = useState('');
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccess] = useState('');

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Parse URL parameters
  const aliasPath = searchParams.get('aliasPath') || '';
  const reason = searchParams.get('reason') || '';
  const required = searchParams.get('required') || '';
  
  // Check if location and password are required
  const requiresLocation = required.includes('loc');
  const requiresPassword = required.includes('pass');

  // Auto-request location if only location is required
  useEffect(() => {
    if (requiresLocation && !requiresPassword && !coords) {
      handleLocationRequest().catch(err => {
        setError('Please allow location access to continue');
      });
    }
  }, [requiresLocation, requiresPassword, coords]);

  // Handle error messages based on reason and required parameters
  useEffect(() => {
    if (reason) {
      if (requiresPassword && !requiresLocation) {
        setError('Incorrect password. Please try again.');
      } else if (requiresLocation && !requiresPassword) {
        setError('You are outside the permitted location area.');
      } else if (requiresLocation && requiresPassword) {
        setError('Either the password is incorrect or you are outside the permitted location area.');
      }
    }
  }, [reason, requiresPassword, requiresLocation]);

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
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
          position => {
            const { latitude, longitude } = position.coords;
            setCoords({ lat: latitude, lon: longitude });
            resolve({ latitude, longitude });
          },
          error => {
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

    // Build query params
    const params = new URLSearchParams();
    if (requiresPassword) {
      params.set('passcode', password);
    }
    if (requiresLocation) {
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

    // Let the browser do a normal navigation
    const authUrl = `https://getmyuri.com/r/${aliasPath}${params.toString() ? '?' + params.toString() : ''}`;
    window.location.href = authUrl;
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

          {requiresLocation && !coords && (
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
              (requiresPassword && !password) ||
              (requiresLocation && !coords)
            }
          >
            {loading ? 'Verifying…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
