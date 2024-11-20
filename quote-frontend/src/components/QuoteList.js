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
      const response = await api.post(`/quotes/${quote.quoteId}/finalize`);
      if (response.data.success) {
        if (onQuoteUpdated) {
          onQuoteUpdated();
        }
      } else {
        console.error('Failed to finalize quote: ', response.data.message);
      }
    } catch (error) {
      console.error('Error finalizing quote: ', error);
    }
  }
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
        </>
      )}
      <button onClick={() => onEdit(quote)}>Edit</button>
      <button onClick={toggleItems}>
        {showItems ? 'Hide Items' : 'Show Items'}
      </button>
      {showItems && (
        <ul>
          {quote.items.map((item) => (
            <li key={item.lineItemId}>
              <p>Description: {item.description}</p>
              <p>Price: ${item.price}</p>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export default QuoteList;