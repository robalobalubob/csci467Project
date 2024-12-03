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
  };

  /**
   * Handles when a line item is changed
   * @param {*} index index of line item changed
   * @param {*} field description
   * @param {*} value price
   */
  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...lineItems];
    updatedItems[index][field] = value;
    setLineItems(updatedItems);
  };

  /**
   * Handles when the delete item button is pressed
   * @param {*} index index of item to remove
   */
  const handleRemoveLineItem = (index) => {
    const updatedItems = lineItems.filter((_, i) => i !== index);
    setLineItems(updatedItems);
  };

  /**
   * Handles when the save quote button is pressed
   * Will update status to 'unresolved'
   */
  const handleSave = async () => {
    try {
      const updatedQuote = {
        ...quote,
        items: lineItems,
        discount,
        discountType,
        secretNotes,
        status: quoteStatus,
      };
      await api.put(`/quotes/${quote.quoteId}`, updatedQuote);
      onSave();
    } catch (error) {
      console.error('Error saving quote:', error);
      alert('Error saving quote');
    }
  };

  return (
    <div className="container">
      <h3>Edit Quote ID: {quote.quoteId}</h3>
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
            id={`price-${index}`}
            name="price"
            placeholder="Price"
            value={item.price}
            onChange={(e) =>
              handleLineItemChange(index, 'price', parseFloat(e.target.value) || 0)
            }
            required
          />
          <div className="flex">
            <button className="button button-secondary" type="button" onClick={() => handleRemoveLineItem(index)}>
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
          id="discount"
          value={discount}
          onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
          min="0"
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

      <div className="flex mt-20">
        <button className="button" onClick={handleSave}>Save Quote</button>
        <button className="button button-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

export default QuoteEditor;
