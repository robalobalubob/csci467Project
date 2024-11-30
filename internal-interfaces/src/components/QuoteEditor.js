import React, { useState, useEffect } from 'react';
import api from '../services/api';

function QuoteEditor({ quote, onSave, onCancel }) {
  const [lineItems, setLineItems] = useState([]);
  const [discount, setDiscount] = useState(quote.discount || 0);
  const [discountType, setDiscountType] = useState(quote.discountType || 'amount');
  const [secretNotes, setSecretNotes] = useState(quote.secretNotes || '');
  const [quoteStatus] = useState(quote.status || 'unresolved');

  useEffect(() => {
    setLineItems(quote.items || []);
  }, [quote]);

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: '', price: 0 }]);
  };

  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...lineItems];
    updatedItems[index][field] = value;
    setLineItems(updatedItems);
  };

  const handleRemoveLineItem = (index) => {
    const updatedItems = lineItems.filter((_, i) => i !== index);
    setLineItems(updatedItems);
  };

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
    <div>
        <h3>Edit Quote ID: {quote.quoteId}</h3>
        <h4>Line Items</h4>
        {lineItems.map((item, index) => (
            <div key={index}>
            <input
                placeholder="Description"
                value={item.description}
                onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
            />
            <input
                type="number"
                placeholder="Price"
                value={item.price}
                onChange={(e) =>
                handleLineItemChange(index, 'price', parseFloat(e.target.value) || 0)
                }
            />
            <button onClick={() => handleRemoveLineItem(index)}>Remove</button>
            </div>
        ))}
        <button onClick={handleAddLineItem}>Add Line Item</button>

        <h4>Discount</h4>
        <select value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
            <option value="amount">Amount</option>
            <option value="percentage">Percentage</option>
        </select>
        <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
        />

        <h4>Secret Notes</h4>
        <textarea value={secretNotes} onChange={(e) => setSecretNotes(e.target.value)} />
        <br/>
        <button onClick={handleSave}>Save Quote</button>
        <button onClick={onCancel}>Cancel</button>
    </div>
  );
}

export default QuoteEditor;
