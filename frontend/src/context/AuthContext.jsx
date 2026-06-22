import { createContext, useContext, useState, useEffect } from 'react';

// Step 1: Create the context object
// This is like creating an empty box that will hold our auth state
const AuthContext = createContext();

// Step 2: Create the Provider component
// This wraps our entire app and makes auth state available everywhere
export const AuthProvider = ({ children }) => {
  // user = the logged in user's info (name, email, id)
  // null means no one is logged in
  const [user, setUser] = useState(null);

  // loading = true while we check localStorage on first load
  // Prevents the app from flashing the login page briefly
  const [loading, setLoading] = useState(true);

  // On app start, check if a token exists in localStorage
  // If it does, restore the user session automatically
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      // Parse the user object from the string stored in localStorage
      setUser(JSON.parse(savedUser));
    }

    // Done checking — allow the app to render
    setLoading(false);
  }, []); // empty array = run only once when app first loads

  // Called after successful login or register
  const login = (userData, token) => {
    // Save to localStorage so session persists after browser refresh
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));

    // Update React state so UI re-renders immediately
    setUser(userData);
  };

  // Called when user clicks logout
  const logout = () => {
    // Clear everything from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Clear React state — UI will redirect to login
    setUser(null);
  };

  return (
    // Provide these values to ALL child components
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Step 3: Custom hook for easy access
// Instead of importing useContext + AuthContext everywhere,
// components just call useAuth()
export const useAuth = () => useContext(AuthContext);