import React, { useState, useEffect } from 'react';
import api from '../services/api';
import QuoteList from './QuoteList';
import QuoteEditor from './QuoteEditor';

function QuoteManagement() {
  const [quotes, setQuotes] = useState([]);
  const [editingQuote, setEditingQuote] = useState(null);

  const fetchQuotes = async () => {
    try {
      const response = await api.get('/quotes', {
        params: {
          status: ['submitted', 'unresolved'],
        },
      });
      setQuotes(response.data);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleQuoteUpdated = () => {
    setEditingQuote(null);
    fetchQuotes();
  };

  const handleSanction = async (quote) => {
    try {
      await api.post(`/quotes/${quote.quoteId}/sanction`);
      fetchQuotes();
    } catch (error) {
      console.error('Error sanctioning quote:', error);
      alert('Error sanctioning quote');
    }
  };

  return (
    <div>
      <h2>Quote Management</h2>
      {editingQuote ? (
        <QuoteEditor
          quote={editingQuote}
          onSave={handleQuoteUpdated}
          onCancel={() => setEditingQuote(null)}
        />
      ) : (
        <QuoteList quotes={quotes} onEdit={setEditingQuote} onSanction={handleSanction} />
      )}
    </div>
  );
}

export default QuoteManagement;
