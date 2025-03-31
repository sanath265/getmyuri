import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import CustomizeLink from './components/CustomizeLink';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check login status from localStorage on app load
    const loginStatus = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loginStatus);
    setIsLoading(false);
  }, []);

  // Don't render anything while checking login status
  if (isLoading) {
    return null;
  }

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    if (!isLoggedIn) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  // Public Route component (accessible only when not logged in)
  const PublicRoute = ({ children }) => {
    if (isLoggedIn) {
      return <Navigate to="/" />;
    }
    return children;
  };

  // Render home page based on login status
  const HomeRoute = () => {
    return isLoggedIn ? <CustomizeLink setIsLoggedIn={setIsLoggedIn} /> : <Home />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login setIsLoggedIn={setIsLoggedIn} />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard setIsLoggedIn={setIsLoggedIn} />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
