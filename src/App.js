import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import CustomizeLink from './components/CustomizeLink';
import Contact from './components/Contact';
import Auth from './components/Auth';
import './App.css';

// Custom component to handle logout and redirect to home
function LogoutHandler() {
  const { logout } = useAuth();
  
  React.useEffect(() => {
    // Ensure user is logged out
    localStorage.removeItem('isLoggedIn');
    logout();
  }, [logout]);
  
  // Redirect to home page
  return <Navigate to="/" replace />;
}

function AppRoutes() {
  const { isLoggedIn } = useAuth();
  return (
    <Routes>
      <Route path="/" element={isLoggedIn ? <CustomizeLink /> : <Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/customize" element={<CustomizeLink />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/auth" element={<Auth />} />
      {/* Logout route that ensures user is logged out and redirects to home */}
      <Route path="/logout" element={<LogoutHandler />} />
      {/* Catch-all route for GitHub Pages 404 redirect */}
      <Route path="*" element={<Auth />} />
    </Routes>
  );
}

function App() {
  // Get the basename from the environment or use default for GitHub Pages
  const basename = process.env.PUBLIC_URL || '';

  return (
    <AuthProvider>
      <Router basename={basename}>
        <div className="App">
          <ToastContainer />
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
