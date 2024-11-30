import React, { useState } from 'react';
import api from '../services/api';

function QuoteList({ quotes, onEdit, onQuoteUpdated }) {
  return (
    <div>
      <h3>Your Quotes</h3>
      {quotes.length === 0 ? (
        <p>No quotes found.</p>
      ) : (
        <ul>
          {quotes.map((quote) => (
            <QuoteItem key={quote.quoteId} quote={quote} onEdit={onEdit} onQuoteUpdated={onQuoteUpdated} />
          ))}
        </ul>
      )}
    </div>
  );
}

function QuoteItem({ quote, onEdit, onQuoteUpdated }) {
  const [showItems, setShowItems] = useState(false);

  const toggleItems = () => {
    setShowItems((prevShowItems) => !prevShowItems);
  };

  const handleFinalizeQuote = async () => {
    try {
      const response = await api.post(`/quotes/${quote.quoteId}/submit`);
      if (response.data.success) {
        if (onQuoteUpdated) {
          onQuoteUpdated();
        }
      } else {
        console.error('Failed to submit quote: ', response.data.message);
      }
    } catch (error) {
      console.error('Error submit quote: ', error);
    }
  }

  const handleDeleteQuote = async () => {
    if (window.confirm('Are you sure you want to delete this quote?')) {
      try {
        const response = await api.delete(`/quotes/${quote.quoteId}`);
        if (response.data.success) {
          if (onQuoteUpdated) {
            onQuoteUpdated();
          }
        } else {
          console.error('Failed to delete quote: ', response.data.message);
        }
      } catch (error) {
        console.error('Error deleting quote: ', error);
      }
    }
  };

  return (
    <li>
      <p>Quote ID: {quote.quoteId}</p>
      <p>Customer ID: {quote.customerId}</p>
      <p>Email: {quote.email}</p>
      <p>Status: {quote.status}</p>
      {quote.status === 'draft' && (
        <>
        <button onClick={() => onEdit(quote)}>Edit</button>
        <button onClick={handleFinalizeQuote}>Submit</button>
        <button onClick={handleDeleteQuote}>Delete</button>
        </>
      )}
      <button onClick={toggleItems}>
        {showItems ? 'Hide Items' : 'Show Items'}
      </button>
      {showItems && (
        <ul>
          {quote.items.map((item) => (
            <li key={item.lineItemId}>
              <p>Description: {item.description}</p>
              <p>Price: ${parseFloat(item.price).toFixed(2)}</p>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export default QuoteList;