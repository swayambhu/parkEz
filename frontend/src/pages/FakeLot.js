import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import lotImage from '../assets/images/fakelot.jpg';

import axios from 'axios';
import { PStyle, LotCanvas, TimeH2, ImageDiv, Button, ButtonsDiv, LabelsDiv, AdImage, AdBanner } from '../shared/visuals';
import { formatDate, formatDateNoTime, formatAmount } from '../shared/tools';

const API_URL = process.env.REACT_APP_API_URL;

const FakeLot = () => {
    const { lot } = useParams();
    const [ad, setAd] = useState(null);
    const [currentTopImageIndex, setCurrentTopImageIndex] = useState(1);

    useEffect(() => {

        // Fetch data using axios instead of fetch
        axios.post(`${API_URL}ads/serve_ad/`, { lot_id: lot || 'colltown' })
            .then(response => {
                console.log(response.data);
                setAd(response.data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });

    }, [lot]);


    useEffect(() => {
        if (ad && ad.seconds) {
            // Set the interval for changing images
            const interval = setInterval(() => {
                setCurrentTopImageIndex(prevIndex =>
                    (prevIndex + 1) % 3
                );
            }, ad.seconds * 1000); // Convert seconds to milliseconds

            // Clear the interval when the component unmounts or ad changes
            return () => clearInterval(interval);
        }
    }, [ad]);

    const handleAdClick = () => {
        if (ad && ad.advert_id) {
            axios.post(`${API_URL}ads/increment_clicks/`, { advert_id: ad.advert_id })
            .then(response => {
                console.log('Click incremented successfully:', response.data);
            })
            .catch(error => {
                console.error('Error incrementing click:', error);
            });
        }
    };

    return (
        <div style={{ minHeight: '95vh' }}>
            {ad && (
                <AdBanner style={{marginTop:'60px'}}>
                    <a href={ad.url} target="_blank" rel="noopener noreferrer" onClick={handleAdClick}>
                        <AdImage style={{width: '100%', height: 'auto'}} src={[ad.top_banner_image1_path,ad.top_banner_image2_path,ad.top_banner_image3_path][currentTopImageIndex]} />
                    </a>
                </AdBanner>
            )}
            <TimeH2>Current Testing Lot: {lot}</TimeH2>
            <p style={{textAlign:'center'}}>This lot is for testing Ads: Click <Link to='/lot/colltown'>Collingwood Town</Link> for real lot</p>
            <ImageDiv>
            <img style={{maxHeight:'50vh'}} src={lotImage} />
            </ImageDiv>
            <LabelsDiv>
                <PStyle>Best Open Spot: A5</PStyle>
                <PStyle>Spots occupied: B1, B2, B3, A1, A2, A3, A4</PStyle>
            </LabelsDiv>
        </div>
    );
};

export default FakeLot;
