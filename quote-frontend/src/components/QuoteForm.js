import React, { useState, useEffect } from 'react';
import api from '../services/api';

function QuoteForm({ quote, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    ...quote,
    quoteId: quote.quoteId || null,
    associateId: quote.associateId || '',
    customerId: quote.customerId || '',
    email: quote.email || '',
    secretNotes: quote.secretNotes || '',
    items: quote.items || [],
  });

  const [customerInfo, setCustomerInfo] = useState(null);
  const [customerError, setCustomerError] = useState('');

  useEffect(() => {
    const fetchCustomerInfo = async () => {
      if (formData.customerId) {
        try {
          const response = await api.get(`/customers/${formData.customerId}`);
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
  }, [formData.customerId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleItemChange = (index, e) => {
    const items = [...formData.items];
    const value = e.target.name === 'price' ? parseFloat(e.target.value) || 0 : e.target.value;
    items[index][e.target.name] = value;
    setFormData({ ...formData, items });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          itemId: `I${Date.now()}`,
          description: '',
          price: 0,
        },
      ],
    });
  };

  const removeItem = (index) => {
    const items = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const dataToSend = {
      quoteId: formData.quoteId,
      associateId: formData.associateId,
      customerId: formData.customerId,
      email: formData.email,
      secretNotes: formData.secretNotes,
      items: formData.items.map((item) => ({
        lineItemId: item.lineItemId,
        description: item.description,
        price: item.price,
      })),
    };
  
    onSave(dataToSend);
  };

  return (
    <div>
      <h3>{quote.quoteId ? 'Edit Quote' : 'New Quote'}</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Customer ID:</label>
          <input
            type="text"
            name="customerId"
            value={formData.customerId || ''}
            onChange={handleChange}
            required
          />
        </div>
        {customerInfo && (
          <div>
            <h4>Customer Information</h4>
            <p><strong>Name:</strong> {customerInfo.name}</p>
            <p><strong>City:</strong> {customerInfo.city}</p>
            <p><strong>Street:</strong> {customerInfo.street}</p>
            <p><strong>Contact:</strong> {customerInfo.contact}</p>
          </div>
        )}
        {customerError && (
          <p style={{ color: 'red' }}>{customerError}</p>
        )}
        <div>
          <label>Customer Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Secret Notes:</label>
          <textarea
            name="secretNotes"
            value={formData.secretNotes || ''}
            onChange={handleChange}
          ></textarea>
        </div>
        <h4>Items</h4>
        {formData.items.map((item, index) => (
          <div key={item.lineItemId || item.itemId}>
            <input
              type="text"
              name="description"
              placeholder="Item Description"
              value={item.description}
              onChange={(e) => handleItemChange(index, e)}
              required
            />
            <input
              type="number"
              step="0.01"
              name="price"
              placeholder="Price"
              value={item.price}
              onChange={(e) => handleItemChange(index, e)}
              required
            />
            <button type="button" onClick={() => removeItem(index)}>
              Remove Item
            </button>
          </div>
        ))}
        <button type="button" onClick={addItem}>
          Add Item
        </button>
        <br />
        <button type="submit" disabled={!customerInfo}>
          Save Quote
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default QuoteForm;