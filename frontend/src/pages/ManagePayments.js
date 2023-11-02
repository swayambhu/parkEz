import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

const API_URL = process.env.REACT_APP_API_URL;

const ManagePayments = () => {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const stripe = useStripe();
    const elements = useElements();
    const [resetKey, setResetKey] = useState(0);

    const fetchPaymentMethods = async () => {
        try {
            const response = await axios.get(API_URL + 'business/payment_methods', { withCredentials: true });
            setPaymentMethods(response.data.payment_methods);
        } catch (error) {
            console.error('Failed to fetch payment methods:', error);
        }
    };

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    const handleAddPaymentMethod = async () => {
        if (!stripe || !elements) {
            return;
        }
    
        const card = elements.getElement(CardElement);
        const result = await stripe.createPaymentMethod({
            type: 'card',
            card: card,
        });
    
        if (result.error) {
            console.error(result.error.message);
        } else {
            try {
                await axios.post(API_URL + 'business/add_payment_method', { token: result.paymentMethod.id }, { withCredentials: true });
                // Refresh payment methods list after adding
                fetchPaymentMethods();
                // Reset the CardElement
                setResetKey(prevKey => prevKey + 1);
            } catch (error) {
                console.error('Failed to add payment method:', error);
            }
        }
    };    

    const handleDeletePaymentMethod = async (paymentMethodId) => {
        try {
            await axios.delete(API_URL + `business/delete_payment_method/${paymentMethodId}`, { withCredentials: true });
            // Refresh payment methods list after deletion
            fetchPaymentMethods();
        } catch (error) {
            console.error('Failed to delete payment method:', error);
        }
    };

    const handleSetDefaultPaymentMethod = async (paymentMethodId) => {
        try {
            await axios.put(API_URL + `business/update_default_payment_method/${paymentMethodId}`, {}, { withCredentials: true });
            fetchPaymentMethods();
        } catch (error) {
            console.error('Failed to update default payment method:', error);
        }
    };
    

    const buttonStyle = {
        backgroundColor: 'blue',
        color: 'white',
        padding: '10px 15px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        margin: '5px',
        boxShadow: '2px 2px 8px rgba(0,0,0,0.2)'
    };

    return (
        <div style={{minHeight:'95vh', margin:'3em'}}>
            <h2>Manage Payment Methods</h2>
            <table style={{marginTop: '20px', width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                    <tr>
                        <th>Card Brand</th>
                        <th>Details</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {paymentMethods.map(method => (
                        <tr key={method.id}>
                            <td>{method.card.brand}</td>
                            <td>
                              Ending in {method.card.last4}
                              {method.is_default && <span style={{color: 'green', marginLeft: '10px'}}>(Default)</span>}
                            </td>
                            <td>
                                <button style={buttonStyle} onClick={() => handleDeletePaymentMethod(method.id)}>Delete</button>
                                <button style={buttonStyle} onClick={() => handleSetDefaultPaymentMethod(method.id)}>Set as Default</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <h3 style={{marginTop:'2em'}}>Add new Payment Method</h3>
            <div>
                <CardElement key={resetKey} />
                <button style={buttonStyle} onClick={handleAddPaymentMethod}>Add Payment Method</button>
            </div>
        </div>
    );
};

export default ManagePayments;