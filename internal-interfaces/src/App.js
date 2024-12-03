import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import QuoteManagement from './components/QuoteManagement.js';
import PurchaseOrderProcessing from './components/PurchaseOrderProcessing.js';
import './App.css';

function App() {
  return (
    <div className="container">
      <h1>Internal Interfaces</h1>
      <nav>
        <NavLink
          to="/quotes"
          className={({ isActive }) => `button ${isActive ? 'active' : ''}`}
        >
          Quote Management
        </NavLink>
        <NavLink
          to="/purchase-orders"
          className={({ isActive }) => `button button-secondary ${isActive ? 'active' : ''}`}
        >
          Purchase Order Processing
        </NavLink>
      </nav>
      <Routes>
        <Route path="/quotes" element={<QuoteManagement />} />
        <Route path="/purchase-orders" element={<PurchaseOrderProcessing />} />
        <Route path="/" element={<QuoteManagement />} />
      </Routes>
    </div>
  );
}

export default App;