import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { PStyle, LotCanvas, TimeH2, ImageDiv, Button, ButtonsDiv, LabelsDiv } from '../shared/visuals';
import { formatDate } from '../shared/tools';

const API_URL = process.env.REACT_APP_API_URL;

const Archive = () => {
    const canvasRef = useRef(null);
    const [humanTime, setHumanTime] = useState('');
    const [lotName, setLotName] = useState('');
    const [previousImageName, setPreviousImageName] = useState('');
    const [nextImageName, setNextImageName] = useState('');
    const { lot, imageName } = useParams();
    const [selectedTimestamp, setSelectedTimestamp] = useState("");
    const [comboBoxChoices, setComboBoxChoices] = useState([]);
    const [comboBoxChoicesLinks, setComboBoxChoicesLinks] = useState([]);
    const [overparkingData, setOverparkingData] = useState({});
    const [overparkingConfirmLinks, setOverparkingConfirmLinks] = useState({}); 
    const overparkingStyle = {
      margin: "auto",
      textAlign: "center", 
    };
    function findOverparking(allData, currentDateString){
      const sortedData = allData.slice().sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return dateA - dateB;
      });
      const spotNames = Object.keys(sortedData[0].human_labels);
      let spotOccupancyTime = {};
      let lastFreeSpace = {};
      spotNames.forEach(spotNames => {
        spotOccupancyTime[spotNames] = 0;
        lastFreeSpace[spotNames] = '';
      });
      let indexOfCurrentImage = sortedData.findIndex(item => item.image_url.includes(currentDateString));
      if (currentDateString === 'default'){
        indexOfCurrentImage = sortedData.length - 1;
      }
      for (let x = 0; x < indexOfCurrentImage; x++){
        for (let keyName of spotNames){
          let time_diff = (new Date(sortedData[x+1].timestamp) - new Date(sortedData[x].timestamp))/60000 / 60;
        
          if (sortedData[x+1].human_labels[keyName]) {
    
            // Makes it so first picture of car in spot counts as minute 0 in determining overparking
            if (x !== indexOfCurrentImage-1) spotOccupancyTime[keyName] = spotOccupancyTime[keyName] + time_diff;
            
          } else {
            spotOccupancyTime[keyName] = 0;
            let match = sortedData[x+1].image_url.match(/_(\d+)\./);
            if (match) {
              lastFreeSpace[keyName] = match[1];
            }
          }
        }
      }
      let current_datetime = '';
      let match = sortedData[sortedData.length-1].image_url.match(/_(\d+)\./);
      if (match) {
        current_datetime = match[1];
      }
      if (currentDateString !== 'default'){
        current_datetime = currentDateString;
      }
    
      let occupancyCheckLink = {};
      spotNames.forEach(spotNames => {
        occupancyCheckLink[spotNames] = sortedData[0].url_name + '/' + spotNames + '/' + lastFreeSpace[spotNames] + '/' + current_datetime + '/';
      });
    
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
    
    
      return [spotOccupancyTime, occupancyCheckLink];
    }

    const navigate = useNavigate();

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');


        axios.get(`${API_URL}lot/lot_specific/`, { 
            params: { 
                lot: lot, 
                image: imageName 
            } 
        })
        .then(response => {
            const data = response.data;
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
            setLotName(data.name);
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
            axios.get(`${API_URL}lot/get_lot_history/`, {withCredentials: true,
              params: { 
                  url_name: lot, 
              } 
            })
            .then(response => {
                let str = data.image_url;
                let regex = /_(\d+)\./;
                let match = str.match(regex);
                let time_string = match[1]

                const data2 = response.data;

                const [occupancyTime, occupancyLinks] = findOverparking(data2.images_data, time_string);
                setOverparkingData(occupancyTime);
                setOverparkingConfirmLinks(occupancyLinks);

      
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
          })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
        



    }, [lot, imageName]);

    const handlePrevious = () => {
        navigate(`/archive/${lot}/${previousImageName}`);
    };

    const handleNext = () => {
        navigate(`/archive/${lot}/${nextImageName}`);
    };
    const handleTimestampChange = (event) => {
      setSelectedTimestamp(event.target.value);
      const choiceNumber = comboBoxChoices.indexOf(event.target.value);
      navigate(`/archive/${lot}/${comboBoxChoicesLinks[choiceNumber]}/`);
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
            <TimeH2>{lotName} - {humanTime}</TimeH2>
            <ButtonsDiv>
                <Button onClick={handlePrevious}>Previous</Button>
                <Button onClick={handleNext}>Next</Button>
            </ButtonsDiv>
            <ImageDiv>
                <LotCanvas ref={canvasRef} />
            </ImageDiv>
            <table style={overparkingStyle}>
            <thead>
              <tr>
                <th>Spot Name </th>
                <th>Hours Parked</th>
              </tr>
            </thead>
            <tbody>
                {Object.keys(overparkingData).map((key) => 
                    overparkingData[key] !== 0 && (
                        <tr key={key}>
                            <td>
                                <Link 
                                    to={`/overpark-confirm/${overparkingConfirmLinks[key]}`}
                                    style={{ color: overparkingData[key] > 5 ? "red" : "black", fontWeight: overparkingData[key] > 5 ? "bold" : "normal" }}
                                >
                                    {key}
                                </Link>
                            </td>
                            <td>
                                <Link 
                                    to={`/overpark-confirm/${overparkingConfirmLinks[key]}`}
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
    );
};

export default Archive;
