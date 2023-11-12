import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { PStyle, LotCanvas, TimeH2, ImageDiv, Button, ButtonsDiv, LabelsDiv, AdImage, AdBanner } from '../shared/visuals';
import { formatDate, formatDateNoTime, formatAmount } from '../shared/tools';

const API_URL = process.env.REACT_APP_API_URL;

const BusinessDashboard = () => {
    const canvasRef = useRef(null);
    const { lot } = useParams();
    const navigate = useNavigate();
    const [humanLabels, setHumanLabels] = useState('');
    const [bestSpot, setBestSpot] = useState('');
    const [lotName, setLotName] = useState('');
    const [humanTime, setHumanTime] = useState('');
    const [previousImageName, setPreviousImageName] = useState('');

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Fetch data using axios instead of fetch
        axios.get(`${API_URL}lot/business_dashboard/`, { withCredentials: true })
            .then(response => {
                const data = response.data;
                let imagesData = response.data.images_data;

                // Function to parse the timestamp string into a Date object
                const parseTimestamp = (timestampString) => new Date(timestampString);

                // Using reduce to find the most recent image
                const mostRecentImage = imagesData.reduce((latest, current) => {
                    return parseTimestamp(current.timestamp) > parseTimestamp(latest.timestamp) ? current : latest;
                });

                console.log(mostRecentImage); // This will log the object with the most recent timestamp
                console.log(data);
                const trueLabels = Object.entries(mostRecentImage.human_labels)
                    .filter(([key, value]) => value === true)
                    .map(([key]) => key)
                    .join(", ");

                let bestSpotString = 'None available';
                let BestSpotSoFarKey = 99999;
                for (let spot in Object.keys(data.bestspots)) {
                    if (!mostRecentImage.human_labels[data.bestspots[spot]] & Number(spot) < BestSpotSoFarKey) {
                        bestSpotString = data.bestspots[spot];
                        BestSpotSoFarKey = Number(spot);
                    }
                }
                setLotName(mostRecentImage.name);
                setBestSpot(bestSpotString);
                setHumanLabels(trueLabels);
                setHumanTime(mostRecentImage.timestamp);
                setPreviousImageName(data.previous_image_name_part);

                const image = new Image();
                image.src = API_URL + mostRecentImage.image_url;
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
                        } else if (mostRecentImage.human_labels[key]) {
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

            })


    }, [lot]);

    const handlePrevious = () => {
        navigate(`/image/${lot || 'colltown'}/${previousImageName}`);
    };

    return (
        <div style={{ minHeight: '95vh' }}>
            <TimeH2>{lotName} - {formatDate(humanTime)}</TimeH2>
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

export default BusinessDashboard;
