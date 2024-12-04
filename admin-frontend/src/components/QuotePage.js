import React, { useState, useEffect } from 'react';
import QuoteSearchForm from './QuoteSearchForm';
import QuoteList from './QuoteList';
import api from '../services/api';
import '../App.css';

/**
 * QuotePage Component
 * Page that holds QuoteSearchForm and QuoteList
 * @returns React Display info
 */
function QuotePage() {
  const [quotes, setQuotes] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  /**
   * Handles what to do when the quote list is filtered by quote search
   * @param {*} filters what to filter the search by
   */
  const handleSearch = async (filters) => {
    try {
      const response = await api.get('admin/quotes', { params: filters });
      setQuotes(response.data);
    } catch (error) {
      console.error('Error searching quotes:', error);
      alert('Error searching quotes');
    }
  };

  /**
   * Toggles whether or the filters should be visible
   */
  const toggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  /**
   * Ensures default quotes are retrieved when navigating to the page
   */
  useEffect(() => {
    const fetchDefaultQuotes = async () => {
      const defaultFilters = {};
      await handleSearch(defaultFilters);
    };

    fetchDefaultQuotes();
  }, []);

  return (
    <div className="form-group">
      <h2>Quotes</h2>
      <button
        className="button button-secondary toggle-filters-button"
        onClick={toggleFilters}
      >
        {showFilters ? 'Hide Filters' : 'Show Filters'}
      </button>
      <div id="quote-search-form" className={showFilters ? '' : 'hidden'}>
        {showFilters && <QuoteSearchForm onSearch={handleSearch} />}
      </div>
      <QuoteList quotes={quotes} />
    </div>
  );
}

export default QuotePage;