import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const AdvertiserDashboard = () => {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    axios
      .get(API_URL + "ads/current_user_ads", { withCredentials: true })
      .then((res) => {
        console.log(res.data.ads);
        setAds(res.data.ads);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <div style={{height:'95vh'}}>
        <h1>Advertiser Dashboard</h1>

        {ads.map((ad, index) => (
            <div key={ad.advert_id} style={{ marginBottom: "30px" }}>
                <h2>
                  Advertisement {index + 1}: {ad.name} <span><Link to={`/edit-ad/${ad.advert_id}`}>(Edit)</Link></span>
                </h2>
                <p><strong>Name:</strong> {ad.name}</p>
                <p><strong>Start Date:</strong> {ad.start_date}</p>
                <p><strong>End Date:</strong> {ad.end_date}</p>
                <p><strong>Target URL:</strong> {ad.url}</p>
                <p><strong>Impressions:</strong> {ad.impressions}</p>
                <p><strong>Clicks:</strong> {ad.clicks}</p>
                <p><strong>Image Change Interval:</strong> {ad.image_change_interval} seconds</p>
                <div>
                  <strong>Image 1:</strong><br />
                  <img 
                      style={{ border: "2px solid gray" }} 
                      src={`data:image/jpeg;base64,${ad.top_banner_image1_base64}`} 
                      alt="Image 1"  
                  /><br />
                  <strong>Image 2:</strong><br />
                  <img 
                      style={{ border: "2px solid gray" }} 
                      src={`data:image/jpeg;base64,${ad.top_banner_image2_base64}`} 
                      alt="Image 2"  
                  /><br />
                  <strong>Image 3:</strong><br />
                  <img 
                      style={{ border: "2px solid gray" }} 
                      src={`data:image/jpeg;base64,${ad.top_banner_image3_base64}`} 
                      alt="Image 3"  
                  />
              </div>
                {/* Lot information */}
                <h3>Lots Associated:</h3>
                {ad.lots.length === 0 ? (
                    <h3>None</h3>
                ) : (
                    <table border="1">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>City</th>
                          <th>GPS Coordinates</th>
                          <th>State</th>
                          <th>ZIP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ad.lots.map((lot) => (
                          <tr key={lot.id}>
                            <td>{lot.name}</td>
                            <td>{lot.city}</td>
                            <td>{lot.gps_coordinates}</td>
                            <td>{lot.state}</td>
                            <td>{lot.zip ? lot.zip : 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                )}
            </div>
        ))}
    </div>
  );
};

export default AdvertiserDashboard;  
