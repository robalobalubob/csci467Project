import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../App.css';

function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  /**
   * Handles when a user logs out
   */
  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <nav>
      {user ? (
        <div className="flex">
          <NavLink to="/dashboard" className="button">Dashboard</NavLink>
          <button className="button button-secondary" onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <NavLink to="/" className="button">Login</NavLink>
      )}
    </nav>
  );
}

export default Navbar;
