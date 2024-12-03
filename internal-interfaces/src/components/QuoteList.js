import React from 'react';
import '../App.css';

function QuoteList({ quotes, onEdit, onSanction }) {
  return (
    <div className="form-group">
      <h3>Quotes</h3>
      {quotes.length === 0 ? (
        <p>No quotes found.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Quote ID</th>
              <th>Customer ID</th>
              <th>Total Amount</th>
              <th>Discount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote) => (
              <tr key={quote.quoteId}>
                <td>{quote.quoteId}</td>
                <td>{quote.customerId}</td>
                <td>${parseFloat(quote.totalAmount).toFixed(2)}</td>
                <td>
                  {quote.discountType === 'percentage' ? `${quote.discount}%` : `$${parseFloat(quote.discount).toFixed(2)}`}
                </td>
                <td>{quote.status}</td>
                <td>
                  <button className="button button-secondary" onClick={() => onEdit(quote)}>Edit Quote</button>
                  {quote.status === 'unresolved' && (
                    <button className="button button-secondary" onClick={() => onSanction(quote)}>Sanction & Send</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default QuoteList;
