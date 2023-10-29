import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { PStyle, LotCanvas, TimeH2, ImageDiv, Button, ButtonsDiv, LabelsDiv, AdImage, AdBanner } from '../shared/visuals';
import { formatDate, formatDateNoTime, formatAmount } from '../shared/tools';

const API_URL = process.env.REACT_APP_API_URL;

const LotLatest = () => {
    const canvasRef = useRef(null);
    const { lot } = useParams();
    const navigate = useNavigate();
    const [humanLabels, setHumanLabels] = useState('');
    const [bestSpot, setBestSpot] = useState('');
    const [humanTime, setHumanTime] = useState('');
    const [ad, setAd] = useState(null);
    const [currentTopImageIndex, setCurrentTopImageIndex] = useState(1);
    const [previousImageName, setPreviousImageName] = useState('');

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Fetch data using axios instead of fetch
        axios.get(`${API_URL}lot/lot_latest/`, { params: { url_name: lot } })
            .then(response => {
                const data = response.data;
                console.log(response.data);
                const trueLabels = Object.entries(data.human_labels)
                    .filter(([key, value]) => value === true)
                    .map(([key]) => key)
                    .join(", ");

                let bestSpotString = 'None available';
                let BestSpotSoFarKey = 99999;
                for (let spot in Object.keys(data.bestspots)) {
                    if (!data.human_labels[data.bestspots[spot]] & Number(spot) < BestSpotSoFarKey) {
                        bestSpotString = data.bestspots[spot];
                        BestSpotSoFarKey = Number(spot);
                    }
                }
                setBestSpot(bestSpotString);
                setHumanLabels(trueLabels);
                setHumanTime(data.timestamp);
                setPreviousImageName(data.previous_image_name_part);

                const image = new Image();
                image.src = API_URL + data.image_url;
                image.onload = () => {
                    canvas.width = image.width;
                    canvas.height = image.height;
                    context.drawImage(image, 0, 0, canvas.width, canvas.height);

                    const entries = Object.entries(data.spots);
                    entries.reverse().forEach(([key, value]) => {
                        const [x1, x2, y1, y2] = value;
                        const width = x2 - x1;
                        const height = y2 - y1;

                        if (key === bestSpotString) {
                            context.strokeStyle = 'green';
                            context.fillStyle = 'green';
                        } else if (data.human_labels[key]) {
                            context.strokeStyle = 'red';
                            context.fillStyle = 'red';
                        } else {
                            context.strokeStyle = 'blue';
                            context.fillStyle = 'blue';
                        }
                        context.lineWidth = 7;
                        context.strokeRect(x1, y1, width, height);
                        context.strokeStyle = 'black'; 
                        context.fillStyle = 'white';
                        context.font = "40px Arial";     
                        context.strokeText(key, x1, y1 - 5);
                        context.fillText(key, x1, y1 - 5);  
                    
                    });
                }

                return axios.post(`${API_URL}ads/serve_ad/`, { lot_id: lot || 'colltown' });
            })
            .then(response => {
                console.log(response.data);
                setAd(response.data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });

    }, [lot]);

    const handlePrevious = () => {
        navigate(`/image/${lot || 'coldwater'}/${previousImageName}`);
    };

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
            <TimeH2>{formatDate(humanTime)}</TimeH2>
            <ImageDiv>
            <LotCanvas ref={canvasRef} />
            </ImageDiv>
            <ButtonsDiv>
                <Button onClick={handlePrevious}>Previous</Button>
            </ButtonsDiv>
            <LabelsDiv>
                <PStyle>Best Open Spot: {bestSpot}</PStyle>
                <PStyle>Spots occupied: {humanLabels}</PStyle>
            </LabelsDiv>
        </div>
    );
};

export default LotLatest;
