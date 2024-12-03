import api from '../services/api';
import '../App.css';

/**
 * QuoteList Component
 * Establishes QuoteList for display
 * @param {*} input quotes, onEdit, onQuoteUpdated 
 * @returns react display info
 */
function QuoteList({ quotes, onEdit, onQuoteUpdated }) {
  return (
    <div>
      <h3>Your Quotes</h3>
      {quotes.length === 0 ? (
        <p>No quotes found.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Quote ID</th>
              <th>Customer ID</th>
              <th>Email</th>
              <th>Status</th>
              <th>Total Amount ($)</th>
              <th>Line Items</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote) => (
              <QuoteItem key={quote.quoteId} quote={quote} onEdit={onEdit} onQuoteUpdated={onQuoteUpdated} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/**
 * QuoteItem component
 * @param {*} input quote, onEdit, onQuoteUpdated 
 * @returns React display info
 */
function QuoteItem({ quote, onEdit, onQuoteUpdated }) {
  /**
   * Handles when the submit quote button is pressed
   * Updates quote status to submitted
   */
  const handleFinalizeQuote = async () => {
    try {
      const response = await api.post(`/quotes/${quote.quoteId}/submit`);
      if (response.data.success) {
        alert("Quote Submitted Successfully");
        if (onQuoteUpdated) {
          onQuoteUpdated();
        }
      } else {
        console.error('Failed to submit quote: ', response.data.message);
        alert(`Failed to submit quote: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error submit quote: ', error);
      alert('Error submitting quote');
    }
  }

  /**
   * Handles when the delete quote button is pressed
   * Attempts to delete a quote from the database
   */
  const handleDeleteQuote = async () => {
    if (window.confirm('Are you sure you want to delete this quote?')) {
      try {
        const response = await api.delete(`/quotes/${quote.quoteId}`);
        if (response.data.success) {
          alert('Quote deleted successfully');
          if (onQuoteUpdated) {
            onQuoteUpdated();
          }
        } else {
          console.error('Failed to delete quote: ', response.data.message);
          alert(`Failed to delete quote: ${response.data.message}`);
        }
      } catch (error) {
        console.error('Error deleting quote: ', error);
        alert('Error deleting quote');
      }
    }
  };

  const items = Array.isArray(quote.items) ? quote.items : [];

  return (
    <tr>
      <td>{quote.quoteId}</td>
      <td>{quote.customerId}</td>
      <td>{quote.email}</td>
      <td>{quote.status}</td>
      <td>{quote.totalAmount}</td>
      <td>
        {quote.items.length > 0 ? (
            <table className="nested-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Price ($)</th>
                    </tr>
                </thead>
                <tbody>
                    {quote.items.map((item) => (
                        <tr key={item.lineItemId}>
                            <td>{item.description}</td>
                            <td>{parseFloat(item.price).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        ) : (
            <p>No line items.</p>
        )}
      </td>
      <td>
        {quote.status === 'draft' && (
          <>
            <button className="button button-secondary" onClick={() => onEdit(quote)}>Edit</button>
            <button className="button button-secondary" onClick={handleFinalizeQuote}>Submit</button>
            <button className="button button-secondary" onClick={handleDeleteQuote}>Delete</button>
          </>
        )}
      </td>
    </tr>
  );
}

export default QuoteList;