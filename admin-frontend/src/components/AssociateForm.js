import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import '../App.css';

function AssociateForm() {
    const { associateId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        userId: '',
        password: '',
        address: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);

    const isEditMode = Boolean(associateId);

    useEffect(() => {
        if (isEditMode) {
            // Fetch associate details for editing
            const fetchAssociate = async () => {
                try {
                    const response = await api.get(`/associates/${associateId}`);
                    setFormData({
                        name: response.data.name || '',
                        userId: response.data.userId || '',
                        password: '',
                        address: response.data.address || '',
                    });
                } catch (error) {
                    console.error('Error fetching associate:', error);
                    alert('Error fetching associate details');
                    navigate('/associates');
                } finally {
                    setLoading(false);
                }
            };
            fetchAssociate();
        } else {
            setLoading(false);
        }
    }, [associateId, isEditMode, navigate]);

    const validate = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Name is required';
        if (!formData.userId.trim()) errors.userId = 'User ID is required';
        if (!isEditMode && !formData.password.trim()) errors.password = 'Password is required';
        return errors;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            const dataToSend = { ...formData };
            if (isEditMode) {
                // Update associate
                if (!formData.password.trim()) {
                    delete dataToSend.password;
                }
                await api.put(`/associates/${associateId}`, dataToSend);
                alert('Associate updated successfully.');
            } else {
                // Create new associate
                await api.post('/associates', dataToSend);
                alert('Associate created successfully.');
            }
            navigate('/associates');
        } catch (error) {
            console.error('Error saving associate:', error);
            alert('Error saving associate');
        }
    };

    const handleCancel = () => {
        navigate('/associates');
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="container">
            <h2>{isEditMode ? 'Edit Associate' : 'Add New Associate'}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <input 
                        id="name" 
                        name="name" 
                        type='text' 
                        value={formData.name} 
                        onChange={handleChange} 
                        required 
                    />
                    {errors.name && <p className="error-message">{errors.name}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="userId">User ID:</label>
                    <input 
                        id="userId" 
                        name="userId" 
                        type='text' 
                        value={formData.userId} 
                        onChange={handleChange} 
                        required 
                    />
                    {errors.userId && <p className="error-message">{errors.userId}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required={!isEditMode}
                    />
                    {errors.password && <p className="error-message">{errors.password}</p>}
                    {isEditMode && <p className="success-message">Leave blank to keep current password.</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="address">Address:</label>
                    <input 
                        id="address" 
                        name="address" 
                        type='text' 
                        value={formData.address} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="flex">
                    <button className='button' type="submit">Save Associate</button>
                    <button className='button button-secondary' type="button" onClick={handleCancel}>Cancel</button>
                </div>
            </form>
        </div>
    );
}

export default AssociateForm;