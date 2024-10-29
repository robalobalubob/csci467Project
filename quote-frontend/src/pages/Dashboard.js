import React, { useEffect, useState } from 'react';
import api from '../services/api';

function Dashboard() {
  const [users, setUsers] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [lineItems, setLineItems] = useState([]);

  useEffect(() => {
    // Fetch Users
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setUsers(response.data);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    // Fetch Quotes
    const fetchQuotes = async () => {
      try {
        const response = await api.get('/quotes');
        setQuotes(response.data);
      } catch (err) {
        console.error('Error fetching quotes:', err);
      }
    };

    // Fetch Line Items
    const fetchLineItems = async () => {
      try {
        const response = await api.get('/line-items');
        setLineItems(response.data);
      } catch (err) {
        console.error('Error fetching line items:', err);
      }
    };

    fetchUsers();
    fetchQuotes();
    fetchLineItems();
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>

      <section>
        <h3>Users</h3>
        <ul>
          {users.map(user => (
            <li key={user.associateId}>{user.name} ({user.userId}) - {user.role}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Quotes</h3>
        <ul>
          {quotes.map(quote => (
            <li key={quote.quoteId}>
              Quote ID: {quote.quoteId}, Customer ID: {quote.customerId}, Status: {quote.status}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Line Items</h3>
        <ul>
          {lineItems.map(item => (
            <li key={item.lineItemId}>
              Line Item ID: {item.lineItemId}, Description: {item.description}, Price: ${item.price}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default Dashboard;
