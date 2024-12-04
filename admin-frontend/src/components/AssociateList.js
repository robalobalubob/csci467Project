import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../App.css';

/**
 * AssociateList Component
 * Shows a table with all associates
 * @returns React Display info
 */
function AssociateList() {
    const [associates, setAssociates] = useState([]);
    const navigate = useNavigate();

    /**
     * Fetches all associates from the backend
     */
    const fetchAssociates = async () => {
        try {
            const response = await api.get('admin/associates');
            setAssociates(response.data);
        } catch (error) {
            console.error('Error fetching associates:', error);
            alert('Error fetching associates');
        }
    };

    /**
     * Ensures associates are up to date
     */
    useEffect(() => {
        fetchAssociates();
    }, []);

    /**
     * Handles when an associate is selected to be deleted
     * @param {*} associateId associate to be deleted
     */
    const handleDelete = async (associateId) => {
        if (window.confirm('Are you sure you want to delete this associate?')) {
            try {
                await api.delete(`admin/associates/${associateId}`);
                fetchAssociates();
                alert('Associate deleted successfully.');
            } catch (error) {
                console.error('Error deleting associate:', error);
                alert('Error deleting associate');
            }
        }
    };

    /**
     * Handles what happens when edit is selected
     * Navigates to AssociateForm
     * @param {*} associate associate to be edited
     */
    const handleEdit = (associate) => {
        navigate(`/associates/edit/${associate.associateId}`);
    };

    return (
        <div className="form-group">
            <h2>Sales Associates</h2>
            <div className='form-group'>
                <Link to="/associates/add" className='button add-associate-button'>Add New Associate</Link>
            </div>
            <table className="table">
                <thead>
                    <tr>
                        <th>Associate ID</th>
                        <th>Name</th>
                        <th>User ID</th>
                        <th>Address</th>
                        <th>Accumulated Commission ($)</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {associates.map((associate) => (
                        <tr key={associate.associateId}>
                            <td>{associate.associateId}</td>
                            <td>{associate.name}</td>
                            <td>{associate.userId}</td>
                            <td>{associate.address}</td>
                            <td>{parseFloat(associate.accumulatedCommission).toFixed(2)}</td>
                            <td>
                                <button className='button edit-button' onClick={() => handleEdit(associate)}>Edit</button>
                                <button className='button button-secondary delete-button' onClick={() => handleDelete(associate.associateId)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AssociateList;