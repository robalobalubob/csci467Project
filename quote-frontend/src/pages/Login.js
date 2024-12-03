import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

/**
 * Login Component
 * Establishes login functionality and display
 * @param {*} input setUser 
 * @returns React display info
 */
function Login({ setUser }) {
  const [formData, setFormData] = useState({
    user_id: '',
    password: '',
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { user_id, password } = formData;
  /**
   * Handles when inputs in the form change
   * @param {*} e 
   */
  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  /**
   * Handles when the submit button is pressed
   * Attemps to login a user by checking with the database
   * INSECURE for development
   * @param {*} e form information
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { user_id, password });

      if (response.data.success) {
        const userData = {
          user_id: response.data.user_id,
          associate_id: response.data.associate_id,
          name: response.data.name,
        };
        setUser(userData);
        navigate('/dashboard');
      } else {
        setError('Invalid associate ID or password');
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Invalid associate ID or password');
      } else {
        setError('An error occurred. Please try again later.');
      }
      console.error('Login error:', err);
    }
  };

  return (
    <div className="container">
      <div className="login-form">
        <h2>Associate Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="user_id">User ID:</label>
            <input 
              type="text" 
              id="user_id" 
              name="user_id" 
              value={user_id} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              value={password} 
              onChange={handleChange} 
              required 
            />
          </div>
          <button className="button" type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
