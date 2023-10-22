import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const AdvertiserDashboard = () => {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    axios
      .get(API_URL + "ads/current_user_ads", { withCredentials: true })
      .then((res) => {
        setAds(res.data.ads);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <div>
        <h1>Advertiser Dashboard</h1>

        {ads.map((ad) => (
            <div key={ad.advert_id} style={{ marginBottom: "30px" }}>
                <p><strong>Name:</strong> {ad.name}</p>
                <p><strong>Start Date:</strong> {ad.start_date}</p>
                <p><strong>End Date:</strong> {ad.end_date}</p>
                <p><strong>Target URL:</strong> {ad.url}</p>
                <p><strong>Impressions:</strong> {ad.impressions}</p>
                <p><strong>Clicks:</strong> {ad.clicks}</p>
                <p><strong>Image Change Interval:</strong> {ad.image_change_interval} seconds</p>
                <div>
                <strong>Image 1:</strong><br />
                <img src={`data:image/jpeg;base64,${ad.top_banner_image1_base64}`} alt="Image 1"  /><br />
                <strong>Image 2:</strong><br />
                <img src={`data:image/jpeg;base64,${ad.top_banner_image2_base64}`} alt="Image 2"  /><br />
                <strong>Image 3:</strong><br />
                <img src={`data:image/jpeg;base64,${ad.top_banner_image3_base64}`} alt="Image 3"  />
                </div>
            </div>
        ))}
    </div>
  );
};

export default AdvertiserDashboard;