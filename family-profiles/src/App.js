import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Home from './components/Home';
import ProfileCreation from './components/ProfileCreation';
import ProductListing from './components/ProductListing';
import Login from './components/Login';
import Cart from './components/Cart';

function ProtectedRoute({ user, children, onRequireLogin }) {
  const [redirecting, setRedirecting] = useState(false);
  useEffect(() => {
    if (!user) {
      setRedirecting(true);
      const timer = setTimeout(() => {
        onRequireLogin();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, onRequireLogin]);
  if (!user && redirecting) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 transition-opacity duration-300">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">Redirecting to login...</div>
        </div>
      </div>
    );
  }
  if (!user) return null;
  return children;
}

function LogoutRedirect({ shouldRedirectHome, notification }) {
  const location = useLocation();
  if (
    shouldRedirectHome &&
    notification &&
    notification.type === 'success' &&
    notification.message === 'Logout successful!' &&
    location.pathname !== '/'
  ) {
    return <Navigate to="/" replace />;
  }
  return null;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);
  const [notification, setNotification] = useState(null);
  const year = new Date().getFullYear();
  const [shouldRedirectHome, setShouldRedirectHome] = useState(false);
  const [blockProtected, setBlockProtected] = useState(false);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setUser(user);
        setAuthToken(token);
      } else {
        setUser(null);
        setAuthToken(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = (user, token) => {
    setUser(user);
    setAuthToken(token);
    setNotification({ type: 'success', message: 'Login successful!' });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setAuthToken(null);
      setNotification({ type: 'success', message: 'Logout successful!' });
      setShouldRedirectHome(true);
    } catch (error) {
      setNotification({ type: 'error', message: 'Logout failed. Please try again.' });
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    if (shouldRedirectHome && notification && notification.type === 'success' && notification.message === 'Logout successful!') {
      setBlockProtected(true);
      setTimeout(() => {
        setShouldRedirectHome(false);
        setBlockProtected(false);
      }, 200); // Reset after redirect
    }
  }, [shouldRedirectHome, notification]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
        <LogoutRedirect shouldRedirectHome={shouldRedirectHome} notification={notification} />
        {notification && (
          <div className={`fixed top-20 right-6 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-semibold ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {notification.message}
          </div>
        )}
        <Navbar user={user} onLogout={handleLogout} />
        <main className="pt-24 pb-8 min-h-screen bg-gradient-to-br from-[#e3eafc] to-[#f5f7fa] dark:from-gray-900 dark:to-gray-800 transition-colors flex-1">
          <Routes>
            <Route path="/" element={<Home authToken={authToken} />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route
              path="/profiles"
              element={
                !blockProtected && (
                  <ProtectedRoute user={user} onRequireLogin={() => window.location.replace('/login')}>
                    <ProfileCreation authToken={authToken} />
                  </ProtectedRoute>
                )
              }
            />
            <Route
              path="/products"
              element={
                !blockProtected && (
                  <ProtectedRoute user={user} onRequireLogin={() => window.location.replace('/login')}>
                    <ProductListing authToken={authToken} />
                  </ProtectedRoute>
                )
              }
            />
            <Route
              path="/cart"
              element={
                !blockProtected && (
                  <ProtectedRoute user={user} onRequireLogin={() => window.location.replace('/login')}>
                    <Cart authToken={authToken} />
                  </ProtectedRoute>
                )
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        {/* Footer */}
        <footer className="bg-white/80 dark:bg-gray-900/80 border-t border-blue-200 dark:border-gray-700 py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-700 dark:text-gray-300 text-sm text-center md:text-left">
              &copy; {year} PersonaCart. All rights reserved.
            </div>
            <div className="flex space-x-4 text-sm">
              <a href="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-300 transition-colors">Home</a>
              <a href="/profiles" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-300 transition-colors">Profiles</a>
              <a href="/products" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-300 transition-colors">Products</a>
              <a href="#about-section" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-300 transition-colors">About</a>
              <a href="mailto:support@personacart.com" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-300 transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
