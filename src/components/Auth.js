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
  const [location, setLocation] = useState(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Parse URL parameters
  const aliasPath = searchParams.get('aliasPath') || '';
  const reason = searchParams.get('reason') || '';
  const required = searchParams.get('required') || '';
  
  // Check if location and password are required
  const requiresLocation = required.includes('loc');
  const requiresPassword = required.includes('pass');
  const locationRequired = requiresLocation && !location;

  // Auto-request location if only location is required
  useEffect(() => {
    if (locationRequired && !requiresPassword && !coords) {
      handleLocationRequest();
    }
  }, [locationRequired, requiresPassword, coords]);

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

  // Add this function to get location by IP as a fallback
  const getLocationByIP = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) throw new Error('Failed to fetch IP location');
      
      const data = await response.json();
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: 5000 // IP geolocation is typically accurate to city level (~5km)
      };
    } catch (error) {
      console.error('IP location error:', error);
      throw new Error('Unable to determine location by IP');
    }
  };

  // Update the handleLocationRequest function
  const handleLocationRequest = () => {
    if (!navigator.geolocation) {
      // If geolocation is not supported, try IP-based location
      setLoading(true);
      getLocationByIP()
        .then(data => {
          setLoading(false);
          setCoords({
            lat: data.latitude,
            lon: data.longitude
          });
          setLocation({
            latitude: data.latitude,
            longitude: data.longitude,
            accuracy: data.accuracy
          });
        })
        .catch(error => {
          setLoading(false);
          setError('Unable to determine your location. Please check your device settings and try again.');
        });
      return;
    }

    setLoading(true);
    setError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLoading(false);
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        
        // Update both location and coords states
        setLocation({
          latitude,
          longitude,
          accuracy: position.coords.accuracy
        });
        
        setCoords({
          lat: latitude,
          lon: longitude
        });
      },
      (error) => {
        console.error('Location error:', error);
        
        // Handle kCLErrorLocationUnknown specifically
        if (error.code === 2) {
          // Try again with lower accuracy
          const lowAccuracyOptions = {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 0
          };
          
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLoading(false);
              const latitude = position.coords.latitude;
              const longitude = position.coords.longitude;
              
              // Update both location and coords states
              setLocation({
                latitude,
                longitude,
                accuracy: position.coords.accuracy
              });
              
              setCoords({
                lat: latitude,
                lon: longitude
              });
            },
            (retryError) => {
              console.error('Low accuracy location error:', retryError);
              
              // If low accuracy also fails, try IP-based location
              getLocationByIP()
                .then(data => {
                  setLoading(false);
                  setCoords({
                    lat: data.latitude,
                    lon: data.longitude
                  });
                  setLocation({
                    latitude: data.latitude,
                    longitude: data.longitude,
                    accuracy: data.accuracy
                  });
                })
                .catch(ipError => {
                  setLoading(false);
                  setError('Unable to determine your location. Please check your device settings and try again.');
                });
            },
            lowAccuracyOptions
          );
          return;
        }
        
        setLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Location access was denied. Please enable location services to continue.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable. Please check your device settings.');
            break;
          case error.TIMEOUT:
            setError('Location request timed out. Please try again.');
            break;
          default:
            setError('An unknown error occurred while getting location.');
        }
      },
      options
    );
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
                onClick={() => handleLocationRequest()}
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
