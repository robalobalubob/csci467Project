import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import AssociateList from './components/AssociateList';
import AssociateForm from './components/AssociateForm';
import QuotePage from './components/QuotePage';
import './App.css';

function App() {
  return (
    <Router>
      <div className='container'>
        <h1>Admin Interface</h1>
        <nav>
          <NavLink
            to="/associates"
            className={({ isActive }) => `button ${isActive ? 'active' : ''}`}
          >
            Manage Associates
          </NavLink>
          <NavLink
            to="/quotes"
            className={({ isActive }) => `button button-secondary ${isActive ? 'active' : ''}`}
          >
            View Quotes
          </NavLink>
        </nav>

        <Routes>
          <Route path="/" element={<Navigate to="/associates" replace />} />

          <Route path="/associates" element={<AssociateList />} />
          <Route path="/associates/add" element={<AssociateForm />} />
          <Route path="/associates/edit/:associateId" element={<AssociateForm />} />

          <Route path="/quotes" element={<QuotePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;