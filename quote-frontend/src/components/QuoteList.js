import React from 'react';

function QuoteList({ quotes, onEdit }) {
  return (
    <div>
      <h3>Your Quotes</h3>
      {quotes.length === 0 ? (
        <p>No quotes found.</p>
      ) : (
        <ul>
          {quotes.map((quote) => (
            <li key={quote.quoteId}>
              <p>Quote ID: {quote.quoteId}</p>
              <p>Customer ID: {quote.customerId}</p>
              <p>Email: {quote.email}</p>
              <p>Status: {quote.status}</p>
              <button onClick={() => onEdit(quote)}>Edit</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default QuoteList;