import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

const API_URL = process.env.REACT_APP_API_URL;

const Payments = () => {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const stripe = useStripe();
    const elements = useElements();

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
        } catch (error) {
            console.error('Failed to update default payment method:', error);
        }
    };

    return (
        <div>
            <h2>My Payment Methods</h2>
            <div>
                <CardElement />
                <button onClick={handleAddPaymentMethod}>Add Payment Method</button>
            </div>
            <ul>
                {paymentMethods.map(method => (
                    <li key={method.id}>
                        {method.card.brand} ending in {method.card.last4}
                        <button onClick={() => handleDeletePaymentMethod(method.id)}>Delete</button>
                        <button onClick={() => handleSetDefaultPaymentMethod(method.id)}>Set as Default</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Payments;
