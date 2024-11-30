import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import QuoteManagement from './components/QuoteManagement.js';
import PurchaseOrderProcessing from './components/PurchaseOrderProcessing.js';

function App() {
  return (
    <div>
      <h1>Internal Interfaces</h1>
      <nav>
        <NavLink
          to="/quotes"
          style={({ isActive }) => ({ fontWeight: isActive ? 'bold' : 'normal' })}
        >
          Quote Management
        </NavLink>
        {' | '}
        <NavLink
          to="/purchase-orders"
          style={({ isActive }) => ({ fontWeight: isActive ? 'bold' : 'normal' })}
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
