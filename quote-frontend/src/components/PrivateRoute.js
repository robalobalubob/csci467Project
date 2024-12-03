import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ user, children }) {
  // If not signed in return to base route.
  return user ? children : <Navigate to="/" replace />;
}

export default PrivateRoute;