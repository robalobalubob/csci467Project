import React, { useState } from 'react';
import api from '../services/api';
import '../App.css';

function AssociateForm({ associate, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        name: associate?.name || '',
        userId: associate?.userId || '',
        password: '',
        address: associate?.address || '',
    });

    const [errors, setErrors] = useState({});

    const validate = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Name is required';
        if (!formData.userId.trim()) errors.userId = 'User ID is required';
        if (!associate?.associateId && !formData.password) errors.password = 'Password is required';
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
            if (associate && associate.associateId) {
                // Update associate

                if (!formData.password) {
                    delete dataToSend.password;
                }

                await api.put(`/associates/${associate.associateId}`, dataToSend);
            } else {
                // Create new associate
                await api.post('/associates', dataToSend);
            }
            onSave();
        } catch (error) {
            console.error('Error saving associate:', error);
            alert('Error saving associate');
        }
    };

    return (
        <div className='container'>
            <div className="form-group">
                <h2>{associate && associate.associateId ? 'Edit Associate' : 'Add New Associate'}</h2>
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
                            required={!associate || !associate.associateId}
                        />
                        {errors.password && <p className="error-message">{errors.password}</p>}
                        {associate && associate.associateId && <p className="success-message">Leave blank to keep current password.</p>}
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
                        <button className='button button-secondary' type="button" onClick={onCancel}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AssociateForm;