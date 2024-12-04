import React, { useState, useEffect } from 'react';
import api from '../services/api';
import QuoteList from './QuoteList';
import QuoteEditor from './QuoteEditor';
import '../App.css';
/**
 * QuoteManagement Component
 * Contains everything for sanctioning a quote
 * @returns React Display info
 */
function QuoteManagement() {
  const [quotes, setQuotes] = useState([]);
  const [editingQuote, setEditingQuote] = useState(null);

  /**
   * Fetches quotes for an updated list
   */
  const fetchQuotes = async () => {
    try {
      const response = await api.get('internal/quotes', {
        params: {
          status: ['submitted', 'unresolved'],
        },
      });
      setQuotes(response.data);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    }
  };

  /**
   * Calls fetches quotes to keep list updated
   */
  useEffect(() => {
    fetchQuotes();
  }, []);

  /**
   * Handles when a quote is updated
   * Passed to QuoteEditor
   */
  const handleQuoteUpdated = () => {
    setEditingQuote(null);
    fetchQuotes();
  };

  /**
   * Handles when the quote is sanctioned
   * Passed to QuoteList
   * @param {*} quote 
   */
  const handleSanction = async (quote) => {
    try {
      await api.post(`internal/quotes/${quote.quoteId}/sanction`);
      fetchQuotes();
    } catch (error) {
      console.error('Error sanctioning quote:', error);
      alert('Error sanctioning quote');
    }
  };

  return (
    <div className="container">
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
