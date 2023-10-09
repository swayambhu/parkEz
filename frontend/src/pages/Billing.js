import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

const Billing = () => {
    const navigate = useNavigate();
    const [paymentMethods, setPaymentMethods] = useState([]);
    const formatDate = (timestamp) => {
        const date = new Date(timestamp * 1000);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    const handleManagePayments = () => {
        navigate("/manage-payments");
    }
    const [invoices, setInvoices] = useState([]);
    const fetchInvoices = async () => {
        try {
            const response = await axios.get(API_URL + 'business/invoices', { withCredentials: true });
            setInvoices(response.data.invoices);
        } catch (error) {
            console.error('Failed to fetch invoices:', error);
        }
    };
    const fetchPaymentMethods = async () => {
        try {
            const response = await axios.get(API_URL + 'business/payment_methods', { withCredentials: true });
            setPaymentMethods(response.data.payment_methods);
        } catch (error) {
            console.error('Failed to fetch payment methods:', error);
        }
    };
    const defaultPaymentMethod = paymentMethods.find(pm => pm.is_default);
    useEffect(() => {
        fetchInvoices();
        fetchPaymentMethods(); 
    }, []);
    

    const handlePayInvoice = async (invoiceId) => {
        try {
            await axios.post(API_URL + `business/pay_invoice/${invoiceId}`, {}, { withCredentials: true });
            fetchInvoices();  // Refresh invoices list after payment
        } catch (error) {
            console.error('Failed to pay invoice:', error);
        }
    };
    const buttonStyle = {
        backgroundColor: 'blue',
        color: 'white',
        padding: '10px 15px',
        marginTop: '1em',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        margin: '5px',
        boxShadow: '2px 2px 8px rgba(0,0,0,0.2)'
    };
    const centerContainerStyle = {
        marginTop:'1em',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
    };
    


    return (
        <div style={{ minHeight: '70vh', margin: '3em' }}>
            <h3>Billing and Invoices</h3>            
            <table style={{ marginTop: '20px', width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>Invoice ID</th>
                        <th>Description</th>
                        <th>Start Date</th> 
                        <th>End Date</th> 
                        <th>Amount ($)</th>
                        <th>Quantity</th> 
                        <th>Total ($)</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                {invoices.map(invoice => (
                    <tr key={invoice.id}>
                        <td>{invoice.id}</td>
                        <td>{invoice.description}</td>
                        <td>{invoice.start_date ? formatDate(invoice.start_date) : 'N/A'}</td>
                        <td>{invoice.end_date ? formatDate(invoice.end_date) : 'N/A'}</td>
                        <td>${invoice.price_per_item?.toFixed(2) || 'N/A'}</td>
                        <td>{invoice.quantity || 'N/A'}</td>
                        <td>${invoice.total?.toFixed(2) || 'N/A'}</td> 
                        <td>{invoice.status}</td>
                        <td>
                            {invoice.status !== 'paid' && (
                                <button style={buttonStyle} onClick={() => handlePayInvoice(invoice.id)}>Pay</button>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <div style={centerContainerStyle}>
                {defaultPaymentMethod ? (
                    <div>
                        <strong><u>Current Payment Method: </u></strong>
                        <strong>Brand:</strong> {defaultPaymentMethod.card.brand}, 
                        <strong>Last 4 Digits:</strong> {defaultPaymentMethod.card.last4}, 
                        <strong>Exp Date:</strong> {defaultPaymentMethod.card.exp_month}/{defaultPaymentMethod.card.exp_year}
                    </div>) : (
                    <div><strong>Current Payment Method</strong>: None</div>)
                }

                <button style={buttonStyle} onClick={handleManagePayments}>Manage Payment Method</button>
            </div>
        </div>
    );
    
};

export default Billing;
