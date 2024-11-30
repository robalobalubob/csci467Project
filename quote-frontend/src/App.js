import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  return (
    <Router>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Login setUser={setUser} />} />

        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute user={user}>
              <Dashboard user={user} />
            </PrivateRoute>
          } 
        />
        
      </Routes>
    </Router>
  );
}

export default App;
