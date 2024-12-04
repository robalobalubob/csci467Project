import React, { useState, useEffect } from 'react';
import { ReactComponent as EmailIcon } from '../email.svg';
import api from '../services/api';
import '../App.css';

/**
 * QuoteForm component
 * Establishes the QuoteForm for display
 * @param {*} input quote, onSave, onCancel
 * @returns 
 */
function QuoteForm({ quote, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    ...quote,
    quoteId: quote.quoteId || null,
    associateId: quote.associateId || '',
    customerId: quote.customerId || '',
    email: quote.email || '',
    secretNotes: quote.secretNotes || '',
    items: Array.isArray(quote.items) && quote.items.length > 0 ? quote.items : [{
      lineItemId: `I${Date.now()}`,
      description: '',
      price: 0,
    }],
  });

  const [customerInfo, setCustomerInfo] = useState(null);
  const [customerError, setCustomerError] = useState('');
  const [emailValid, setEmailValid] = useState(null);
  const [formError, setFormError] = useState('');

  /**
   * Will fetch customer info based on customerId
   */
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

  /**
   * Basic email validation
   * @param {*} email from input html
   * @returns true or false depending on the regex test
   */
  const validateEmail = (email) => {
    // Basic email Regex
    const regex = /^\S+@\S+\.\S+$/;
    return regex.test(email);
  };

  /**
   * Called when a change occurs when input changes in the form
   * @param {*} e input from html
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'email') {
      const isValid = validateEmail(value);
      setEmailValid(isValid);
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  /**
   * Handles when an item changes in the form
   * Updates information in formData
   * @param {*} index index of edited item
   * @param {*} e input from html
   */
  const handleItemChange = (index, e) => {
    const items = [...formData.items];
    const value = e.target.name === 'price' ? parseFloat(e.target.value) || 0 : e.target.value;
    items[index][e.target.name] = value;
    setFormData({ ...formData, items });
  };

  /**
   * Handles when the Add Item button is pressed
   * Adds a new item to formData
   */
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

  /**
   * Handles when the delete item button is pressed
   * Removes an item from formData
   * @param {*} index index of item to remove
   */
  const removeItem = (index) => {
    if (formData.items.length === 1) {
      setFormError('At least one line item must be present.');
      return;
    }
    const items = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items });
    setFormError('');
  };

  /**
   * Handles when the submit button is pressed
   * Checks validity of email
   * Properly forms the formData to send
   * @param {*} e input from form
   * @returns if email is invalid
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormError('');

    if (!validateEmail(formData.email)) {
      setEmailValid(false);
      setFormError('Please enter a valid email address.');
      return;
    }

    if (formData.items.length === 0) {
      setFormError('At least one line item is required.');
      return;
    }
    
    for (const item of formData.items) {
      if (!item.description || item.price < 0) {
        setFormError('Line item prices cannot be negative.');
        return;
    }
    }
  
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
  
    try {
      await onSave(dataToSend);
      alert('Quote saved successfully!');
    } catch (error) {
      alert('Error saving quote.');
    }
  };

  return (
    <div className="container">
      <h3>{quote.quoteId ? 'Edit Quote' : 'New Quote'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="customerId">Customer ID:</label>
          <input
            type="text"
            id="customerId"
            name="customerId"
            value={formData.customerId || ''}
            onChange={handleChange}
            required
          />
        </div>
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
        <div className="form-group">
          <label htmlFor="email">Customer Email:</label>
          <div className="email-input-container">
            <EmailIcon className="email-icon" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              required
              className={emailValid === false ? 'error' : emailValid === true ? 'success' : ''}
            />
          </div>
          {emailValid === false && (
            <p className="error-message" id="email-feedback" role="alert">
              Please enter a valid email address.
            </p>
          )}
          {emailValid === true && (
            <p className="success-message" id="email-feedback" role="status">
              Email looks good!
            </p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="secretNotes">Secret Notes:</label>
          <textarea
            id="secretNotes"
            name="secretNotes"
            value={formData.secretNotes || ''}
            onChange={handleChange}
            rows="4"
          ></textarea>
        </div>
        <h4>Items</h4>
        {formData.items.map((item, index) => (
          <div key={item.lineItemId || item.itemId} className="form-group">
            <label htmlFor={`description-${index}`}>Item Description:</label>
            <input
              type="text"
              id={`description-${index}`}
              name="description"
              placeholder="Item Description"
              value={item.description}
              onChange={(e) => handleItemChange(index, e)}
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
              onChange={(e) => handleItemChange(index, e)}
              required
            />
            <button className="button button-secondary" type="button" onClick={() => removeItem(index)}>
              Remove Item
            </button>
          </div>
        ))}
        <button className="button" type="button" onClick={addItem}>
          Add Item
        </button>
        <br />
        {formError && <p className="error-message">{formError}</p>}
        <div className="flex mt-20">
          <button className="button" type="submit" disabled={!customerInfo}>
            Save Quote
          </button>
          <button className="button button-secondary" type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default QuoteForm;