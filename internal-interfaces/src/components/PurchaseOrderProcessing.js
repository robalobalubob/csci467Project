import React, { useState, useEffect } from 'react';
import api from '../services/api';

function PurchaseOrderProcessing() {
  const [sanctionedQuotes, setSanctionedQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [finalDiscount, setFinalDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchSanctionedQuotes = async () => {
    try {
      const response = await api.get('/quotes', {
        params: { status: 'sanctioned' },
      });
      setSanctionedQuotes(response.data);
    } catch (error) {
      console.error('Error fetching sanctioned quotes:', error);
    }
  };

  useEffect(() => {
    fetchSanctionedQuotes();
  }, []);

  const handleProcessOrder = async () => {
    if (finalDiscount < 0 || finalDiscount > selectedQuote.totalAmount) {
      setErrorMessage('Invalid final discount amount.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');
    try {
      const response = await api.post(`/quotes/${selectedQuote.quoteId}/process-order`, {
        finalDiscount,
      });

      if (response.data.success) {
        alert('Purchase order processed successfully');
        fetchSanctionedQuotes();
        setSelectedQuote(null);
        setFinalDiscount(0);
      } else {
        setErrorMessage(response.data.message || 'Error processing purchase order');
      }
    } catch (error) {
      console.error('Error processing purchase order:', error);
      console.log('Backend Error Response:', error.response?.data);
      setErrorMessage(error.response?.data?.message || 'Server error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <h2>Purchase Order Processing</h2>
      {selectedQuote ? (
        <div>
          <h3>Quote ID: {selectedQuote.quoteId}</h3>
          <p>Customer ID: {selectedQuote.customerId}</p>
          <p>Total Amount: ${parseFloat(selectedQuote.totalAmount).toFixed(2)}</p>
          <div>
            <label>Final Discount:</label>
            <input
              type="number"
              value={finalDiscount}
              onChange={(e) => setFinalDiscount(parseFloat(e.target.value) || 0)}
            />
          </div>
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          <button onClick={handleProcessOrder} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Process Purchase Order'}
          </button>
          <button onClick={() => setSelectedQuote(null)}>Cancel</button>
        </div>
      ) : (
        <div>
          <h3>Sanctioned Quotes</h3>
          {sanctionedQuotes.length === 0 ? (
            <p>No sanctioned quotes available for processing.</p>
          ) : (
            <ul>
              {sanctionedQuotes.map((quote) => (
                <li key={quote.quoteId}>
                  <p>Quote ID: {quote.quoteId}</p>
                  <p>Total Amount: ${parseFloat(quote.totalAmount).toFixed(2)}</p>
                  <button onClick={() => setSelectedQuote(quote)}>Select Quote</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default PurchaseOrderProcessing;