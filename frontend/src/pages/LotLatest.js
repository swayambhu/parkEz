import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

const LotLatest = () => {
    const { lot } = useParams();
    const [lotData, setLotData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${API_URL}lot/lot_latest/`, {
                    params: { url_name: lot }
                });
                setLotData(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [lot]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <>
            <h1>Lot is {lot}</h1>
            <img style={{maxHeight: '60vh'}} src={API_URL + lotData.image_url} alt="Latest Image" />
            <p>Timestamp: {lotData.timestamp}</p>
            {console.log(lotData)}
        </>
    );
};

export default LotLatest;
