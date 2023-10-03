import React, { useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';  

const stripePromise = loadStripe('pk_test_51NwvsaDI89byjwRRr5t32OfvNlKh8ywXfqOYp4e6ofb52Xhjuft9jKRLWobLhGowrieHLHU5C9fL13Tq2KzW3yxa00ePSFj4RB');
const API_URL = process.env.REACT_APP_API_URL;

const Billing = () => {

    const CheckoutForm = () => {
        const stripe = useStripe();
        const elements = useElements();
        const [errorMessage, setErrorMessage] = useState(null);
        const [name, setName] = useState('');
        const [email, setEmail] = useState('');

        const handleSubmit = async (event) => {
            event.preventDefault();
            if (!stripe || !elements) return;

            const response = await axios.post(API_URL + 'billing/create-payment-intent/', {
                amount: 1500, 
                currency: 'usd'
            });

            const clientSecret = response.data.id;

            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name,
                        email
                    }
                }
            });

            if (result.error) {
                setErrorMessage(result.error.message);
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    console.log('Payment succeeded!');
                }
            }
        };

        return (
            <div>
                <h2>Payment</h2>
                <p>Payment for Monthly Subscription Service</p>
                <form onSubmit={handleSubmit}>
                    <div className="inputWrapper">
                        <label>Name:</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>

                    <div className="inputWrapper">
                        <label>Email:</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    <div className="inputWrapper">
                        <label>Card Details:</label>
                        <CardElement />
                    </div>

                    <button type="submit" disabled={!stripe}>Pay</button>
                </form>
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            </div>
        );
    };

    return (
        <div style={{ height: '80vh', padding: '5em' }}>
            <Elements stripe={stripePromise}>
                <CheckoutForm />
            </Elements>
            <style jsx>{`
                .inputWrapper {
                    margin-bottom: 15px;
                    padding: 10px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                }

                input {
                    margin-top: 5px;
                    padding: 8px;
                    width: 100%;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
            `}</style>
        </div>
    );
};

export default Billing;
