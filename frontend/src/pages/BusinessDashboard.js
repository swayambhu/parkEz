import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { LotCanvas, TimeH2, ImageDiv, Button, ButtonsDiv } from '../shared/visuals';
import { formatDate } from '../shared/tools';

const API_URL = process.env.REACT_APP_API_URL;

const BusinessDashboard = () => {
    const canvasRef = useRef(null);
    const { lot } = useParams();
    const [currentOccupancy, setCurrentOccupancy] = useState('');
    const [totalSpots, setTotalSpots] = useState('0');
    const [avgToday, setAvgToday] = useState('');
    const [totalToday, setTotalTotal] = useState('');
    const [past7Days, setPast7Days] = useState(['','','','','','','']); 
    const [past7DaysTotal, setPast7DaysTotal] = useState(['','','','','','','']); 
    const [past7DaysAverage, setPast7DaysAverage] = useState(['','','','','','','']); 

    const navigate = useNavigate();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const bis = query.get('bis');
    const [lotName, setLotName] = useState('');
    const [humanTime, setHumanTime] = useState('');
    const [previousImageName, setPreviousImageName] = useState('');
    function countCarsParkedAtTimestamp(humanLabels) {
        return Object.values(humanLabels).reduce((count, isOccupied) => count + (isOccupied ? 1 : 0), 0);
    }
    
    function getDatesForLastNDays(n) {
        let dates = [];
        for (let i = 0; i < n; i++) {
            let d = new Date();
            d.setHours(12, 0, 0, 0); // Set time to noon to avoid DST issues
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().split('T')[0]);
        }
        return dates;
    }
    
    
    function calculateMetrics(imagesData) {
        const last7Days = getDatesForLastNDays(7);
        let dailyMetrics = last7Days.map(day => ({ day, totalCars: 0, totalOccupancyPercent: 0, count: 0 }));
        let totalSpots = imagesData[0] ? Object.keys(imagesData[0].human_labels).length : 0;
        imagesData.forEach(({ timestamp, human_labels }) => {
            const date = timestamp.split('T')[0];
            const carsParked = countCarsParkedAtTimestamp(human_labels);
            const occupancyPercent = (carsParked / totalSpots) * 100;
    
            const dayMetric = dailyMetrics.find(dm => dm.day === date);
            if (dayMetric) {
                dayMetric.totalCars += carsParked;
                dayMetric.totalOccupancyPercent += occupancyPercent;
                dayMetric.count++;
            }
        });
    
        const calculateAverage = (metric) => {
            return metric.count > 0 ? metric.totalOccupancyPercent / metric.count : 0;
        };
    
        dailyMetrics.forEach(metric => {
            metric.averageOccupancy = calculateAverage(metric);
            metric.totalCars /= 2; // Dividing the total true values by 2 as specified
        });
    
        let sevenDayAverageOccupancy = dailyMetrics.reduce((acc, metric) => acc + metric.averageOccupancy, 0) / 7;
        let sevenDayTotalCarsParked = dailyMetrics.reduce((acc, metric) => acc + metric.totalCars, 0);
    
        return {
            dailyMetrics,
            sevenDayAverageOccupancy,
            sevenDayTotalCarsParked
        };
    }    
    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        const dashboardUrl = bis 
        ? `${API_URL}lot/business_dashboard/?business_email=${bis}` 
        : `${API_URL}lot/business_dashboard/`;

        // Fetch data using axios
        axios.get(dashboardUrl, { withCredentials: true })
            .then(response => {
                const data = response.data;
                let imagesData = response.data.images_data;
                
                const metrics = calculateMetrics(imagesData);

                // Function to parse the timestamp string into a Date object
                const parseTimestamp = (timestampString) => new Date(timestampString);

                // Using reduce to find the most recent image
                const mostRecentImage = imagesData.reduce((latest, current) => {
                    return parseTimestamp(current.timestamp) > parseTimestamp(latest.timestamp) ? current : latest;
                });
  
                setCurrentOccupancy(countCarsParkedAtTimestamp(mostRecentImage.human_labels));
                setTotalSpots(Object.keys(mostRecentImage.human_labels).length);
                setAvgToday(parseFloat(metrics.dailyMetrics[0].averageOccupancy.toFixed(1)));
                setPast7DaysAverage(
                    metrics.dailyMetrics.map(item => parseFloat(item.averageOccupancy.toFixed(1)))
                );
                setTotalTotal(metrics.dailyMetrics[0].totalCars);
                setPast7DaysTotal([metrics.dailyMetrics[0].totalCars,metrics.dailyMetrics[1].totalCars,metrics.dailyMetrics[2].totalCars,metrics.dailyMetrics[3].totalCars,metrics.dailyMetrics[4].totalCars,metrics.dailyMetrics[5].totalCars,metrics.dailyMetrics[6].totalCars]);
                setPast7Days([metrics.dailyMetrics[0].day,metrics.dailyMetrics[1].day,metrics.dailyMetrics[2].day,metrics.dailyMetrics[3].day,metrics.dailyMetrics[4].day,metrics.dailyMetrics[5].day,metrics.dailyMetrics[6].day]);


                setLotName(mostRecentImage.name);
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

                        if (mostRecentImage.human_labels[key]) {
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


        }, [lot, bis]);

    const handlePrevious = () => {
        navigate(`/image/${lot || 'colltown'}/${previousImageName}`);
    };

    return (
        <div style={{ minHeight: '95vh' }}>
            <TimeH2>{lotName} - {formatDate(humanTime)}</TimeH2>
            <ImageDiv>
                <LotCanvas ref={canvasRef} />
            </ImageDiv>
            <div style={{textAlign:'center'}}>
                Current Occupancy: {currentOccupancy} / {totalSpots}<br />
                Total car hours today: {totalToday}<br />
                Average occupancy today: {avgToday}%<br />

            </div>
            <div style={{ overflowX: 'auto', textAlign: 'center' }}>
                <table style={{ margin: 'auto', borderCollapse: 'collapse', border: '1px solid black' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '0 10px' }}>Date</th>
                            <th style={{ padding: '0 10px' }}>{past7Days[0].substring(5) + ' '}</th>
                            <th style={{ padding: '0 10px' }}>{past7Days[1].substring(5) + ' '}</th>
                            <th style={{ padding: '0 10px' }}>{past7Days[2].substring(5) + ' '}</th>
                            <th style={{ padding: '0 10px' }}>{past7Days[3].substring(5) + ' '}</th>
                            <th style={{ padding: '0 10px' }}>{past7Days[4].substring(5) + ' '}</th>
                            <th style={{ padding: '0 10px' }}>{past7Days[5].substring(5) + ' '}</th>
                            <th style={{ padding: '0 10px' }}>{past7Days[6].substring(5)}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ padding: '0 10px' }}>7-Day Average Occupancy</td>
                            <td style={{ padding: '0 10px' }}>{past7DaysAverage[0]}</td>
                            <td style={{ padding: '0 10px' }}>{past7DaysAverage[1]}</td>
                            <td style={{ padding: '0 10px' }}>{past7DaysAverage[2]}</td>
                            <td style={{ padding: '0 10px' }}>{past7DaysAverage[3]}</td>
                            <td style={{ padding: '0 10px' }}>{past7DaysAverage[4]}</td>
                            <td style={{ padding: '0 10px' }}>{past7DaysAverage[5]}</td>
                            <td style={{ padding: '0 10px' }}>{past7DaysAverage[6]}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '0 10px' }}>7-Day Total Cars Parked</td>
                            <td style={{ padding: '0 10px' }}>{past7DaysTotal[0]}</td>
                            <td style={{ padding: '0 10px' }}>{past7DaysTotal[1]}</td>
                            <td style={{ padding: '0 10px' }}>{past7DaysTotal[2]}</td>
                            <td style={{ padding: '0 10px' }}>{past7DaysTotal[3]}</td>
                            <td style={{ padding: '0 10px' }}>{past7DaysTotal[4]}</td>
                            <td style={{ padding: '0 10px' }}>{past7DaysTotal[5]}</td>
                            <td style={{ padding: '0 10px' }}>{past7DaysTotal[6]}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <ButtonsDiv>
                <Button onClick={handlePrevious}>Previous</Button>
            </ButtonsDiv>

        </div>
    );
};

export default BusinessDashboard;
