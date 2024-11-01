import React, { useState } from 'react';

function QuoteForm({ quote, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    ...quote,
    customerId: quote.customerId || '',
    email: quote.email || '',
    secretNotes: quote.secretNotes || '',
    items: quote.items || [],
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleItemChange = (index, e) => {
    const items = [...formData.items];
    items[index][e.target.name] = e.target.value;
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
    onSave(formData);
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
          <div key={item.itemId}>
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
        <button type="submit">Save Quote</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default QuoteForm;