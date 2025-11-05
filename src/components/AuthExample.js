import React, { useState, useEffect } from 'react';
import { signIn, signOut, getCurrentUser } from '../config/supabase';
import { authAPI } from '../services/api';

const AuthExample = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          // Example: Fetch user profile from your backend
          // const profile = await authAPI.getProfile();
          // console.log('User profile:', profile);
        }
      } catch (error) {
        console.error('Error checking user:', error);
      }
    };

    checkUser();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      // Sign in with Supabase
      const { user, session, error } = await signIn(email, password);
      
      if (error) throw error;
      
      setUser(user);
      setMessage('Login successful!');
      
      // Example: Call your backend API after successful login
      // const profile = await authAPI.getProfile();
      // console.log('User profile:', profile);
      
    } catch (error) {
      console.error('Login error:', error);
      setMessage(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      setMessage('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      setMessage('Error during logout');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>Authentication Example</h2>
      
      {user ? (
        <div>
          <p>Welcome, {user.email}!</p>
          <p>User ID: {user.id}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <form onSubmit={handleLogin}>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      )}
      
      {message && <p style={{ color: message.includes('success') ? 'green' : 'red' }}>{message}</p>}
      
      <div style={{ marginTop: '20px' }}>
        <h3>Example API Call:</h3>
        <button
          onClick={async () => {
            try {
              // Example: Fetch products from your backend
              // const response = await productAPI.getAll();
              // console.log('Products:', response.data);
              alert('Check console for API response');
            } catch (error) {
              console.error('API Error:', error);
              alert('Error making API call. Check console for details.');
            }
          }}
        >
          Test Backend API
        </button>
      </div>
    </div>
  );
};

export default AuthExample;
