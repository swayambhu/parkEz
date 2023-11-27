import React, { useState, useEffect } from "react";
import {useParams} from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const PageTitle = styled.div`
    margin-left: auto;
    margin-right: auto;
    text-align: center;
    padding-top: 1em;
    padding-bottom: 1em;
    font-size: 2rem;
    line-height: 2;
    `;
const CroppedImage = styled.img`
  object-fit: none; 
  object-position: -${props => props.left}px -${props => props.top}px;
  width: ${props => props.height}px;
  height: ${props => props.width}px;
  clip-path: inset(0 0 0 0);
`;

const ContentContainer = styled.div`
  background-color: white;
  margin-left: auto;
  margin-right: auto;
  width: 80%;
  color: black;
  padding-left:3em;
  padding-right:3em;
  text-align: center;
  margin-bottom: 2em;
  padding-bottom: 2em;
`;

function formatDate(inputdate){
  const timestampUTC = new Date(inputdate); // parse the ISO string into a Date object
  const timestampEST = new Date(timestampUTC.getTime() + (4 * 60 * 60 * 1000)); // subtract 5 hours from UTC to get EST
  let hour = timestampEST.getHours();
  let ampm = 'am'
  if (hour === 0){
    hour = 12;
  } else if (hour > 12){
    hour = hour - 12;
    ampm = 'pm'
  } 
  
  return (timestampEST.getMonth() + 1) + '/' + timestampEST.getDate() + '/' + timestampEST.getFullYear() + ' ' 
    + hour + ':' + String(timestampEST.getMinutes()).padStart(2, '0') + ampm;
};

function timeDifferenceInMinutes(currentString, previousString) {
  const current = new Date(currentString);
  const previous = new Date(previousString);
  const difference = current - previous;
  return (difference / 1000 / 60 / 60).toFixed(1); 
}

const OverparkingConfirm = () => {
  const { lot, space, starttime, endtime } = useParams();
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]);
  const [crop, setCrop] = useState([0,0,0,0]); 
  const [mostRecentTime, setMostRecentTime] = useState('');

  const confirmUrl = `${API_URL}lot/overparking-confirm/${lot}/${space}/${starttime}/${endtime}/` 

  // Fetch data using axios
  useEffect(() => {
  axios.get(confirmUrl, { withCredentials: true })
      .then(response => {
        const data = response.data;
        console.log(data)
      const sortedImages = data.cam_images.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setImages(sortedImages.reverse()); 
      setMostRecentTime(sortedImages[0].timestamp);
      setCrop(data.crop);
      })


  }, [lot, space, starttime, endtime]);

  return (
    <ContentContainer style={{ minHeight: '95vh' }}>
      <PageTitle><em>Overparking Confirmation</em><br /><u>{space}</u> Spot History in <u>{lot}</u></PageTitle>
          {images.map((imageObj, index) => (
              <div key={index}>
                  <p><strong>{`${space} at ${formatDate(imageObj.timestamp)} `}</strong> <br />
                  {`${timeDifferenceInMinutes(mostRecentTime,imageObj.timestamp)} hours before ${formatDate(mostRecentTime)}` }</p>
                  <CroppedImage 
                      src={`${API_URL}${'lots/' + lot + "/photos/" + imageObj.image}`}
                      alt={`Image from ${imageObj.camera_name} at ${imageObj.timestamp}`}
                      top={crop[2]}
                      left={crop[0]}
                      height={crop[1]- crop[0]}
                      width={crop[3] - crop[2]}
                  />
              </div>
          ))}
    </ContentContainer>
  );
};
export default OverparkingConfirm;
