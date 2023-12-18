import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation, Link} from 'react-router-dom';
import axios from 'axios';
import { LotCanvas, TimeH2, ImageDiv, Button, ButtonsDiv } from '../shared/visuals';
import { formatDate } from '../shared/tools';

const API_URL = process.env.REACT_APP_API_URL;

const ArchiveHome = () => {
    const canvasRef = useRef(null);
    const [selectedTimestamp, setSelectedTimestamp] = useState("");
    const [comboBoxChoices, setComboBoxChoices] = useState([]);
    const [comboBoxChoicesLinks, setComboBoxChoicesLinks] = useState([]);  
    const [overparkingData, setOverparkingData] = useState({});
    const [overparkingConfirmLinks, setOverparkingConfirmLinks] = useState({});

    const navigate = useNavigate();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const bis = query.get('bis');
    const [lotName, setLotName] = useState('');
    const [lotUrlName, setLotUrlName] = useState('');
    const [humanTime, setHumanTime] = useState('');
    const [previousImageName, setPreviousImageName] = useState('');
    const overparkingStyle = {
        margin: "auto",
        textAlign: "center", 
    };

    function countCarsParkedAtTimestamp(humanLabels) {
        return Object.values(humanLabels).reduce((count, isOccupied) => count + (isOccupied ? 1 : 0), 0);
    }

    function findOverparking(allData){
        const sortedData = allData.slice().sort((a, b) => {
          const dateA = new Date(a.timestamp);
          const dateB = new Date(b.timestamp);
          return dateA - dateB; // For ascending order
        });

        const spotNames = Object.keys(sortedData[0].human_labels);
        let spotOccupancyTime = {};
        let lastFreeSpace = {};
      
        spotNames.forEach(spotNames => {
          spotOccupancyTime[spotNames] = 0;
          lastFreeSpace[spotNames] = '';
        });
        let occupancyCheckLink = {};
        for (let x = 0; x < sortedData.length-1; x++){
          for (let keyName of spotNames){
            let time_diff = (new Date(sortedData[x+1].timestamp) - new Date(sortedData[x].timestamp))/60000 / 60;
            if((sortedData[x+1].human_labels)[keyName]){
              // Makes it so first picture of car in spot counts as minute 0 in determining overparking
              if (x !== sortedData.length-2) spotOccupancyTime[keyName] = spotOccupancyTime[keyName] + time_diff;        
            } else {
              spotOccupancyTime[keyName] = 0;
              let match = sortedData[x+1].image_url.match(/_(\d+)\./);
              if (match) {
                lastFreeSpace[keyName] = match[1];
              }
            }
          }
        }

        let choices = [];
        let choicesString = [];
        for (let a of sortedData){
            console.log(a);
          const temp = a.image_url;
          const match = temp.match(/_(\d+)\./);
          let imgcropped = "";
          if (match) {
            imgcropped = match[1];
          }
          const yearTemp =  imgcropped.slice(0,4);
          const monthTemp =  Number(imgcropped.slice(4,6));
          const dayTemp = Number(imgcropped.slice(6,8));
          const hourTemp = Number(imgcropped.slice(8,10)) % 12 || 12;
          const minuteTemp = imgcropped.slice(10,12);
          const ampmTemp = Number(imgcropped.slice(8,10)) < 12 ? "am" : "pm";
          const dateString = monthTemp + '/' + dayTemp + '/' + yearTemp + ' ' + hourTemp + ':' + minuteTemp + ampmTemp;
          choices.unshift(dateString);
          choicesString.unshift(imgcropped);
        }
        setComboBoxChoices(choices);
        setComboBoxChoicesLinks(choicesString);

        let current_datetime = '';
        let match = sortedData[sortedData.length-1].image_url.match(/_(\d+)\./);
        if (match) {
          current_datetime = match[1];
        }

        occupancyCheckLink = {};
        spotNames.forEach(spotNames => {
          occupancyCheckLink[spotNames] = sortedData[0].url_name + '/' + spotNames + '/' + lastFreeSpace[spotNames] + '/' + current_datetime + '/';
          // overparking_confirm/<str:lot>/<str:cam>/<str:spot>/<str:startdatetime>/<str:enddatetime>/
        });
        return [spotOccupancyTime, occupancyCheckLink];
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

        // Fetch data using axios
        axios.get(`${API_URL}lot/business_dashboard/`, { withCredentials: true })
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
  

                const [occupancyTime, occupancyLinks] = findOverparking(imagesData);
                setOverparkingData(occupancyTime);
                setOverparkingConfirmLinks(occupancyLinks);

                setLotName(mostRecentImage.name);
                setLotUrlName(mostRecentImage.url_name);
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


        }, [bis]);

    const handlePrevious = () => {
        navigate(`/archive/${lotUrlName}/${previousImageName}`);
    };
    const handleTimestampChange = (event) => {
        setSelectedTimestamp(event.target.value);
        const choiceNumber = comboBoxChoices.indexOf(event.target.value);
        navigate(`/archive/${lotUrlName}/${comboBoxChoicesLinks[choiceNumber]}/`);
      };
    return (
        <div style={{ minHeight: '95vh', width:'fit-content',marginLeft:'auto', marginRight:'auto', textAlign:'center' }}>
            <strong>Jump to date/time in archive:</strong> <select value={selectedTimestamp} onChange={handleTimestampChange}>
            {Array.isArray(comboBoxChoices) && comboBoxChoices.map((item, index) => (
                <option key={index} value={item}>
                    {item}
                </option>
            ))}
            </select>
            <TimeH2>{lotName} - {formatDate(humanTime)}</TimeH2>
            <ButtonsDiv>
                <Button onClick={handlePrevious}>Previous</Button>
            </ButtonsDiv>
            <ImageDiv>
                <LotCanvas ref={canvasRef} />
            </ImageDiv>

            <div style={{ overflowX: 'auto', textAlign: 'center' }}>
                <table style={overparkingStyle}>
                <thead>
                <tr>
                    <th>Spot Name &nbsp;&nbsp;&nbsp;</th>
                    <th>Hours Parked</th>
                </tr>
                </thead>
                <tbody>
                    {Object.keys(overparkingData).map((key) => 
                        overparkingData[key] !== 0 && (
                            <tr key={key}>
                                <td>
                                    <Link 
                                        to={`#`}
                                        style={{ color: overparkingData[key] > 5 ? "red" : "black", fontWeight: overparkingData[key] > 5 ? "bold" : "normal" }}
                                    >
                                        {key}
                                    </Link>
                                </td>
                                <td>
                                    <Link 
                                        to={`#`}
                                        style={{ color: overparkingData[key] > 5 ? "red" : "black", fontWeight: overparkingData[key] > 5 ? "bold" : "normal" }}
                                    >
                                        {parseFloat(overparkingData[key].toFixed(1))}
                                    </Link>
                                </td> 
                            </tr>
                        )
                    )}
                </tbody>
                </table>  

            </div>

        </div>
    );
};

export default ArchiveHome;
