import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { PStyle, LotCanvas, TimeH2, ImageDiv, Button, ButtonsDiv, LabelsDiv, AdImage, AdBanner } from '../shared/visuals';
import { formatDate } from '../shared/tools';

const API_URL = process.env.REACT_APP_API_URL;

const SpecificImage = () => {
    const canvasRef = useRef(null);
    const [humanTime, setHumanTime] = useState('');
    const [humanLabels, setHumanLabels] = useState('');
    const [bestSpot, setBestSpot] = useState('');
    const [ad, setAd] = useState(null);
    const [currentTopImageIndex, setCurrentTopImageIndex] = useState(1);
    const [currentSideImageIndex, setCurrentSideImageIndex] = useState(1);
    const [previousImageName, setPreviousImageName] = useState('');
    const [nextImageName, setNextImageName] = useState('');
    const { lot, imageName } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        axios.get(`${API_URL}lot/lot_specific`, { 
            params: { 
                lot: lot, 
                image: imageName 
            } 
        })
        .then(response => {
            const data = response.data;
            console.log(data);
            const trueLabels = Object.entries(data.human_labels)
                .filter(([key, value]) => value === true)
                .map(([key]) => key)
                .join(", ");

            let bestSpotString = 'None available';
            let BestSpotSoFarKey = 99999;
            for (let spot in Object.keys(data.bestspots)){
                if(!data.human_labels[data.bestspots[spot]] & Number(spot) < BestSpotSoFarKey){
                    bestSpotString = data.bestspots[spot];
                    BestSpotSoFarKey = Number(spot);
                }
            }

            setBestSpot(bestSpotString);            
            setHumanLabels(trueLabels);
            setHumanTime(formatDate(data.timestamp));
            setPreviousImageName(data.previous_image_name_part);
            setNextImageName(data.next_image_name_part);

            const image = new Image();
            image.src = API_URL + data.image_url;
            image.onload = () => {
                canvas.width = image.width;
                canvas.height = image.height;
                context.drawImage(image, 0, 0, canvas.width, canvas.height);
                context.lineWidth = 9;
                context.font = "bold 50px Arial";

                const entries = Object.entries(data.spots);
                entries.reverse().forEach(([key, value]) => {
                    const [x1, x2, y1, y2] = value;
                    const width = x2 - x1;
                    const height = y2 - y1;

                    if(key === bestSpotString){
                        context.strokeStyle = 'green';
                        context.fillStyle = 'green';
                    } else if(data.human_labels[key]){
                        context.strokeStyle = 'red';
                        context.fillStyle = 'red';
                    } else {
                        context.strokeStyle = 'blue';
                        context.fillStyle = 'blue';
                    }

                    context.strokeRect(x1, y1, width, height);
                    context.fillText(key, x1, y1 - 5); 
                });
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });

        axios.post(`${API_URL}ads/serve-ad/`, { lot_id: lot })
        .then(response => {
            setAd(response.data);
        })
        .catch(error => {
            console.error('Error fetching ad:', error);
        });

    }, [lot, imageName]);

    const handlePrevious = () => {
        navigate(`/image/${lot}/${previousImageName}`);
    };

    const handleNext = () => {
        navigate(`/image/${lot}/${nextImageName}`);
    };

    useEffect(() => {
        if (ad) {
            const interval = setInterval(() => {
                setCurrentTopImageIndex(prev => (prev % 3) + 1);
                setCurrentSideImageIndex(prev => (prev % 3) + 1);
            }, ad.image_change_interval * 1000);

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
                        <AdImage style={{width: '100%', height: 'auto'}} src={ad[`top_banner_image${currentTopImageIndex}`]} />
                    </a>
                </AdBanner>
            )}
            <TimeH2>{humanTime}</TimeH2>
            <ImageDiv>
                <LotCanvas ref={canvasRef} />
                {ad && (
                    <AdBanner style={{marginLeft:'50px'}}>
                        <a href={ad.url} target="_blank" rel="noopener noreferrer" onClick={handleAdClick}>
                            <AdImage style={{width: '100%', height: 'auto'}} src={ad[`side_banner_image${currentSideImageIndex}`]} />
                        </a>
                    </AdBanner>
                )}
            </ImageDiv>
            <ButtonsDiv>
                <Button onClick={handlePrevious}>Previous</Button>
                <Button onClick={handleNext}>Next</Button>
            </ButtonsDiv>
            <LabelsDiv>
                <PStyle>Best Open Spot: {bestSpot}</PStyle>
                <PStyle>Spots occupied: {humanLabels}</PStyle>
            </LabelsDiv>
        </div>
    );
};

export default SpecificImage;
