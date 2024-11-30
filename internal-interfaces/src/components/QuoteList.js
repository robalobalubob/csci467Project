import React from 'react';

function QuoteList({ quotes, onEdit, onSanction }) {
  return (
    <div>
      <h3>Quotes</h3>
      {quotes.length === 0 ? (
        <p>No quotes found.</p>
      ) : (
        <ul>
          {quotes.map((quote) => (
            <li key={quote.quoteId}>
              <p>Quote ID: {quote.quoteId}</p>
              <p>Customer ID: {quote.customerId}</p>
              <p>Status: {quote.status}</p>
              <button onClick={() => onEdit(quote)}>Edit Quote</button>
              {quote.status === 'unresolved' && (
                <button onClick={() => onSanction(quote)}>Sanction and Send to Customer</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default QuoteList;
