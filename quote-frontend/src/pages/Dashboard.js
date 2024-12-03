import React, { useState, useEffect } from 'react';
import QuoteList from '../components/QuoteList';
import QuoteForm from '../components/QuoteForm.js';
import api from '../services/api';

/**
 * Dashboard Component
 * Establishes display info
 * @param {*} input user 
 * @returns React Display info
 */
function Dashboard({ user }) {
  const [quotes, setQuotes] = useState([]);
  const [editingQuote, setEditingQuote] = useState(null);

  /**
   * Handles when the create quote button is pressed
   * Sets the setEditingQuote function for a new quote
   */
  const handleCreateQuote = () => {
    setEditingQuote({
      quoteId: null, // New quote
      associateId: user.associate_id,
      customerId: '',
      email: '',
      secretNotes: '',
      items: [],
      status: 'draft',
    });
  };

  /**
   * Handles when the edit quote button is pressed
   * Sets the setEditingQuote function for a already existing quote
   * @param {*} quote the quote to be edited
   */
  const handleEditQuote = (quote) => {
    setEditingQuote(quote);
  };

  /**
   * Called when the save quote button is pressed
   * Passed to QuoteForm
   * @param {*} quote 
   */
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
      // Fetch quotes after saving
      const updatedQuotes = await api.get('/quotes', {
        params: { associate_id: user.associate_id },
      });
      setQuotes(updatedQuotes.data);
    } catch (error) {
      console.error('Error saving quote:', error);
      alert('Error saving quote: ' + error.response.data.message);
    }
  };

  /**
   * Handles the the cancel button is pressed while editing a quote
   * Passed to QuoteForm
   */
  const handleCancelEdit = () => {
    setEditingQuote(null);
  };

  /**
   * Handles when the quote is updated
   * Passed to QuoteList
   * Gets quote data from backend
   */
  const handleQuoteUpdated = async () => {
    try {
      const response = await api.get('/quotes', {
        params: { associate_id: user.associate_id },
      });
      setQuotes(response.data);
    } catch (error) {
      console.error('Error refreshing quotes:', error);
    }
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
  }, [user.associate_id])

  return (
    <div className="container">
      <h2>Welcome, {user.name}</h2>
      {editingQuote ? (
        <QuoteForm
          quote={editingQuote}
          onSave={handleSaveQuote}
          onCancel={handleCancelEdit}
        />
      ) : (
        <>
          <div className="flex mb-20">
            <button className="button" onClick={handleCreateQuote}>Create New Quote</button>
          </div>
          <QuoteList
            quotes={quotes.filter(
              (quote) =>
                quote.associateId === user.associate_id &&
                quote.status === 'draft'
            )}
            onEdit={handleEditQuote}
            onQuoteUpdated={handleQuoteUpdated}
          />
        </>
      )}
    </div>
  );
}

export default Dashboard;
