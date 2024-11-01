import React, { useState, useEffect } from 'react';
import QuoteList from '../components/QuoteList';
import QuoteForm from '../components/QuoteForm.js';
import api from '../services/api';

function Dashboard({ user }) {
  const [quotes, setQuotes] = useState([]);
  const [editingQuote, setEditingQuote] = useState(null);

  const handleCreateQuote = () => {
    setEditingQuote({
      quoteId: null, 
      associateId: user.associate_id, // Use the associate_id from logged-in user
      customerId: '', 
      email: '', 
      secretNotes: '',
      items: [],
      status: 'draft',
    });
  };

  const handleEditQuote = (quote) => {
    setEditingQuote(quote);
  };

  const handleSaveQuote = async (quote) => {
    try {
      if (quote.quoteId) {
        // Update existing quote
        await api.put(`/quotes/${quote.quoteId}`, quote);
      } else {
        // Create new quote
        const response = await api.post('/quotes', quote);
        const savedQuote = response.data;
        setQuotes([...quotes, savedQuote]);
      }
      setEditingQuote(null);
    } catch (error) {
      console.error('Error saving quote:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingQuote(null);
  };

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await api.get('/quotes', {
          params: { associate_id: user.associate_id },
        });
        setQuotes(response.data);
      } catch (error) {
        console.error('Error fetching quotes:', error);
      }
    };
    fetchQuotes();
  }, [user.associate_id]);

  return (
    <div>
      <h2>Welcome, {user.name}</h2>
      {editingQuote ? (
        <QuoteForm
          quote={editingQuote}
          onSave={handleSaveQuote}
          onCancel={handleCancelEdit}
        />
      ) : (
        <>
          <button onClick={handleCreateQuote}>Create New Quote</button>
          <QuoteList
            quotes={quotes.filter(
              (quote) =>
                quote.associateId === user.associate_id &&
                quote.status === 'draft'
            )}
            onEdit={handleEditQuote}
          />
        </>
      )}
    </div>
  );
}

export default Dashboard;
