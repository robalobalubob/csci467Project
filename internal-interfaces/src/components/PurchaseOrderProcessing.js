import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../App.css';
/**
 * PurchaseOrderProcessing Component
 * @returns React Display Information
 */
function PurchaseOrderProcessing() {
  const [sanctionedQuotes, setSanctionedQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [finalDiscount, setFinalDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [customerInfo, setCustomerInfo] = useState(null);
  const [customerError, setCustomerError] = useState('');

  /**
   * Retrieves all sanctioned quotes
   */
  const fetchSanctionedQuotes = async () => {
    try {
      const response = await api.get('internal/quotes', {
        params: { status: 'sanctioned' },
      });
      setSanctionedQuotes(response.data);
    } catch (error) {
      console.error('Error fetching sanctioned quotes:', error);
    }
  };

  /**
   * Refreshes list of sancioned quotes
   */
  useEffect(() => {
    fetchSanctionedQuotes();
  }, []);

  /**
   * Fetch customer info based on selected quote's customerId
   */
  useEffect(() => {
    const fetchCustomerInfo = async () => {
      if (selectedQuote && selectedQuote.customerId) {
        try {
          const response = await api.get(`/customers/${selectedQuote.customerId}`);
          setCustomerInfo(response.data);
          setCustomerError('');
        } catch (error) {
          console.error('Error fetching customer info:', error);
          setCustomerInfo(null);
          setCustomerError('Customer not found.');
        }
      } else {
        setCustomerInfo(null);
        setCustomerError('');
      }
    };

    fetchCustomerInfo();
  }, [selectedQuote]);

  /**
   * Handles when the process order button is pressed
   * Ensures quote is prepared to send to external system
   * @returns if there is an issue with quote set up
   */
  const handleProcessOrder = async () => {
    if (finalDiscount < 0 || finalDiscount > selectedQuote.totalAmount) {
      setErrorMessage('Invalid final discount amount.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');
    try {
      const response = await api.post(`internal/quotes/${selectedQuote.quoteId}/process-order`, {
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
    <div className="container">
      <h2>Purchase Order Processing</h2>
      {selectedQuote ? (
        <div className="form-group">
          <h3>Quote ID: {selectedQuote.quoteId}</h3>
          <p>Customer ID: {selectedQuote.customerId}</p>
          {customerInfo && (
            <div className="form-group">
              <h4>Customer Information</h4>
              <table className="customer-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>City</th>
                    <th>Street</th>
                    <th>Contact</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{customerInfo.name}</td>
                    <td>{customerInfo.city}</td>
                    <td>{customerInfo.street}</td>
                    <td>{customerInfo.contact}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {customerError && (
            <p className="error-message">{customerError}</p>
          )}
          <p>Total Amount: ${parseFloat(selectedQuote.totalAmount).toFixed(2)}</p>
          <div className="form-group">
            <label htmlFor="finalDiscount">Final Discount:</label>
            <input
              type="number"
              id="finalDiscount"
              value={finalDiscount}
              onChange={(e) => setFinalDiscount(parseFloat(e.target.value) || 0)}
              min="0"
              max={selectedQuote.totalAmount}
            />
          </div>
          <p>Final Amount: ${parseFloat(selectedQuote.totalAmount).toFixed(2) - finalDiscount}</p>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className="flex">
            <button className="button" onClick={handleProcessOrder} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Process Purchase Order'}
            </button>
            <button className="button button-secondary" onClick={() => setSelectedQuote(null)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="form-group">
          <h3>Sanctioned Quotes</h3>
          {sanctionedQuotes.length === 0 ? (
            <p>No sanctioned quotes available for processing.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Associate ID</th>
                  <th>Quote ID</th>
                  <th>Customer ID</th>
                  <th>Total Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sanctionedQuotes.map((quote) => (
                  <tr key={quote.quoteId}>
                    <td>{quote.associateId}</td>
                    <td>{quote.quoteId}</td>
                    <td>{quote.customerId}</td>
                    <td>${parseFloat(quote.totalAmount).toFixed(2)}</td>
                    <td>
                      <button className="button button-secondary" onClick={() => setSelectedQuote(quote)}>Select Quote</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default PurchaseOrderProcessing;