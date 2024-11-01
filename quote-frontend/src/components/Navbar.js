import React from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <ul>
        {user ? (
          <>
            <li>Welcome, {user.name}</li>
            <li><button onClick={handleLogout}>Logout</button></li>
          </>
        ) : (
          <li>Please log in</li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
