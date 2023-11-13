import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdvertiserDashboard from '../components/Pages/AdvertiserDashboard';

const API_URL = process.env.REACT_APP_API_URL;

const TempDashboard = () => {
    const [userType, setUserType] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(API_URL + "auth/me", { withCredentials: true })
        .then((res) => {
            setUserType(res.data.entitlement_category);
        })
        .catch((err) => {
            console.error(err);
        });
    }, []);  

    const formatUserType = (type) => {
        if (!type) return "";
        return type.toLowerCase().split('_').map(word => word.charAt(0).toUpperCase() + word.substring(1)).join(' ');
    };

    const NavBusiness = () => {
        navigate('/business-dashboard'); 
    }

    const renderContent = () => {
        switch(userType) {
            case 'CUSTOMER_SUPPORT':
                return (
                    <div>
                        <h2>Customer Support Dashboard</h2>
                        <p>Welcome to the customer support dashboard. Here, you can handle all customer queries, track complaints, and ensure customer satisfaction.</p>
                        <h3>Active Tickets</h3>
                        <ul>
                            <li>Ticket #12345: Login issues</li>
                            <li>Ticket #12346: Billing problem</li>
                            <li>Ticket #12347: Account suspension</li>
                        </ul>
                        <h3>Recent Feedback</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Ticket</th>
                                    <th>Feedback</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>#12345</td>
                                    <td>Great support!</td>
                                </tr>
                                <tr>
                                    <td>#12346</td>
                                    <td>Resolved quickly!</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                );
            case 'LOT_SPECIALIST':
                return (
                    <div>
                        <h2>Lot Specialist Dashboard</h2>
                        <p>Welcome to the lot specialist section. Your responsibilities include managing parking lots, ensuring vehicle safety, and more.</p>
                        <h3>Available Lots</h3>
                        <ul>
                            <li>Lot A: 50 spaces available</li>
                            <li>Lot B: 20 spaces available</li>
                        </ul>
                        <h3>Maintenance Schedule</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Lot</th>
                                    <th>Date</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Lot A</td>
                                    <td>20th June</td>
                                    <td>Repainting spots</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                );
            case 'ADVERTISING_SPECIALIST':
                return (
                    <div>
                        <h2>Advertising Specialist Dashboard</h2>
                        <p>Welcome to the advertising department. Your task is to manage campaigns, collaborate with influencers, and more.</p>
                        <h3>Active Campaigns</h3>
                        <ul>
                            <li>Summer Sale</li>
                            <li>Back to School</li>
                        </ul>
                        <h3>Upcoming Meetings</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>10th July</td>
                                    <td>Meeting with Brand X</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                );
            case 'ACCOUNTANT':
                return (
                    <div>
                        <h2>Accountant Dashboard</h2>
                        <p>Welcome to the finance department. You're responsible for managing the company's finances, payroll, taxes, and other financial tasks.</p>
                        <h3>Outstanding Invoices</h3>
                        <ul>
                            <li>Invoice #4567: $5,000</li>
                            <li>Invoice #4568: $10,000</li>
                        </ul>
                        <h3>Monthly Report</h3>
                        <p>This month we saw an increase in revenue by 10%. Expenses were also managed well, with savings in the IT department.</p>
                    </div>
                );
            case 'ADVERTISERS':
                return (
                    <div>
                        <AdvertiserDashboard />
                    </div>
                );
            case 'BUSINESS':
                NavBusiness()
            default:
                return <div>Select a role to view content.</div>;
            }
        }
    
        return (
            <div style={{height:'95vh', padding:'5em'}}>
                {renderContent()}
            </div>
        );
    }
    
    export default TempDashboard;
