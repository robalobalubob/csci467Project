import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../App.css';
/**
 * QuoteEditor Component
 * @param {*} inputs quote, onSave, onCancel 
 * @returns React Display information
 */
function QuoteEditor({ quote, onSave, onCancel }) {
  const [lineItems, setLineItems] = useState([]);
  const [discount, setDiscount] = useState(quote.discount || 0);
  const [discountType, setDiscountType] = useState(quote.discountType || 'amount');
  const [secretNotes, setSecretNotes] = useState(quote.secretNotes || '');
  const [quoteStatus] = useState(quote.status || 'unresolved');
  const [formError, setFormError] = useState('');
  const [customerInfo, setCustomerInfo] = useState(null);
  const [customerError, setCustomerError] = useState('');

  /**
   * Fetch customer info based on customerId
   */
  useEffect(() => {
    const fetchCustomerInfo = async () => {
      if (quote.customerId) {
        try {
          const response = await api.get(`/customers/${quote.customerId}`);
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
  }, [quote.customerId]);

  /**
   * Ensures Line Items are up to date
   */
  useEffect(() => {
    setLineItems(quote.items || []);
  }, [quote]);

  /**
   * Handles when the add line item button is pressed
   */
  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: '', price: 0 }]);
    setFormError('');
  };

  /**
   * Handles when a line item is changed
   * @param {*} index index of line item changed
   * @param {*} field description
   * @param {*} value price
   */
  const handleLineItemChange = (index, field, value) => {
    if (field === 'price' && value > 99999999.99) {
      setFormError('Price exceeds the maximum allowed value.');
      return;
    } else {
      setFormError('');
    }
    const updatedItems = [...lineItems];
    updatedItems[index][field] = value;
    setLineItems(updatedItems);
    setFormError('');
  };

  /**
   * Handles when the delete item button is pressed
   * @param {*} index index of item to remove
   */
  const handleRemoveLineItem = (index) => {
    if (lineItems.length === 1) {
      setFormError('At least one line item is required.');
      return;
    }
    const updatedItems = lineItems.filter((_, i) => i !== index);
    setLineItems(updatedItems);
    setFormError('');
  };

  /**
   * Handles when the save quote button is pressed
   * Will update status to 'unresolved'
   */
  const handleSave = async () => {
    try {

      setFormError('');

      if (lineItems.length === 0) {
        setFormError('At least one line item is required.');
        return;
      } else if (discount < 0) {
        setFormError('Discount must be positive.');
        return;
      }

      for (const item of lineItems) {
        if (!item.description || item.price < 0) {
          setFormError('Line item prices cannot be negative.');
          return;
        } else if (item.price > 99999999.99) {
          setFormError('Price exceeds the maximum allowed value.');
        }
      }

      const updatedQuote = {
        ...quote,
        items: lineItems,
        discount,
        discountType,
        secretNotes,
        status: quoteStatus,
      };
      await api.put(`internal/quotes/${quote.quoteId}`, updatedQuote);
      onSave();
    } catch (error) {
      console.error('Error saving quote:', error);
      alert('Error saving quote');
    }
  };

  return (
    <div className="container">
      <h3>Edit Quote ID: {quote.quoteId}</h3>

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
      <form onSubmit={handleSave}>
      <h4>Line Items</h4>
      {lineItems.map((item, index) => (
        <div key={index} className="form-group">
          <label htmlFor={`description-${index}`}>Description:</label>
          <input
            type="text"
            id={`description-${index}`}
            name="description"
            placeholder="Item Description"
            value={item.description}
            onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
            required
          />
          <label htmlFor={`price-${index}`}>Price:</label>
          <input
            type="number"
            step="0.01"
            id={`price-${index}`}
            name="price"
            placeholder="Price"
            value={item.price}
            onChange={(e) =>
              handleLineItemChange(index, 'price', parseFloat(e.target.value) || 0)
            }
            required
            min="0"
            max="99999999.99"
          />
          <div className="flex">
            <button 
            className="button button-secondary" 
            type="button" 
            onClick={() => handleRemoveLineItem(index)} 
            disabled={lineItems.length === 1}>
              Remove Item
            </button>
          </div>
        </div>
      ))}
      <div className="form-group">
        <button className="button" type="button" onClick={handleAddLineItem}>
          Add Line Item
        </button>
      </div>
      <h4>Discount</h4>
      <div className="form-group">
        <label htmlFor="discountType">Discount Type:</label>
        <select
          id="discountType"
          value={discountType}
          onChange={(e) => setDiscountType(e.target.value)}
        >
          <option value="amount">Amount</option>
          <option value="percentage">Percentage</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="discount">Discount Value:</label>
        <input
          type="number"
          step="0.01"
          id="discount"
          value={discount}
          onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
          min="0"
          max="99999999.99"
          required
        />
      </div>

      <h4>Secret Notes</h4>
      <div className="form-group">
        <label htmlFor="secretNotes">Notes:</label>
        <textarea
          id="secretNotes"
          name="secretNotes"
          value={secretNotes}
          onChange={(e) => setSecretNotes(e.target.value)}
          rows="4"
        ></textarea>
      </div>
      {formError && <p className="error-message">{formError}</p>}
      <div className="flex mt-20">
        <button className="button" type="submit">Save Quote</button>
        <button className="button button-secondary" onClick={onCancel}>Cancel</button>
      </div>
      </form>
      
      
      
      
      
    </div>
  );
}

export default QuoteEditor;
