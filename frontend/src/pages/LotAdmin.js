import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 

const API_URL = process.env.REACT_APP_API_URL;

const LotAdmin = () => {
    const [businesses, setBusinesses] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        axios.get(`${API_URL}lot/all_businesses/`, { withCredentials: true })
            .then(response => {
                setBusinesses(response.data);
            })
            .catch(error => {
                console.error('Error fetching business data:', error);
            });
    }, []);

    const handleRowClick = (email) => {
        navigate(`/business-dashboard?bis=${email}`);
    };

    return (
        <div style={{ overflowX: 'auto', textAlign: 'center', height: '93vh' }}>
            <table style={{ margin: 'auto', marginTop:'5em', borderCollapse: 'collapse', border: '1px solid black' }}>
                <thead>
                    <tr>
                        <th style={{ padding: '0 10px' }}>Business ID</th>
                        <th style={{ padding: '0 10px' }}>Email</th>
                        <th style={{ padding: '0 10px' }}>Name</th>
                    </tr>
                </thead>
                <tbody>
                    {businesses.map(business => (
                        <tr key={business.id} onClick={() => handleRowClick(business.email)} style={{ cursor: 'pointer' }}>
                            <td style={{ padding: '0 10px' }}>{business.id}</td>
                            <td style={{ padding: '0 10px' }}>{business.email}</td>
                            <td style={{ padding: '0 10px' }}>{business.name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LotAdmin;