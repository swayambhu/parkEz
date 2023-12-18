import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const AdAdmin = () => {
    const [advertisersInfo, setAdvertisersInfo] = useState([]);

    
    useEffect(() => {
        axios.get(API_URL + "ads/advertisers-ads-info", { withCredentials: true })
             .then((res) => {
                 setAdvertisersInfo(res.data.advertisers_info);
             })
             .catch((err) => {
                 console.error(err);
             });
    }, []);

    return (
        <div style={{ margin: '3em', height: '95vh' }}>
            <h1>Advertisers</h1>
            {advertisersInfo.map((advertiser) => (
                <div key={advertiser.email} style={{ marginBottom: "50px" }}>
                    <h2>{advertiser.email}</h2>
                    {advertiser.ads.map((ad, index) => (
                        <div key={ad.advert_id} style={{ marginBottom: "30px", marginLeft: "20px" }}>
                            <h3>
                                Advertisement {index + 1}: {ad.name}                                
                            </h3>

                            <p><strong>Name:</strong> {ad.name}</p>
                            <p><strong>Start Date:</strong> {ad.start_date}</p>
                            <p><strong>End Date:</strong> {ad.end_date}</p>
                            <p><strong>Target URL:</strong> {ad.url}</p>
                            <p><strong>Impressions:</strong> {ad.impressions}</p>
                            <p><strong>Clicks:</strong> {ad.clicks}</p>

                            {ad.top_banner_image1_base64 && (
                                <>
                                    <strong>Image 1:</strong><br />
                                    <img 
                                        style={{ border: "2px solid gray" }} 
                                        src={`data:image/jpeg;base64,${ad.top_banner_image1_base64}`} 
                                        alt="Image 1"  
                                    /><br />
                                </>
                            )}

                            {ad.top_banner_image2_base64 && (
                                <>
                                    <strong>Image 2:</strong><br />
                                    <img 
                                        style={{ border: "2px solid gray" }} 
                                        src={`data:image/jpeg;base64,${ad.top_banner_image2_base64}`} 
                                        alt="Image 2"  
                                    /><br />
                                </>
                            )}

                            {ad.top_banner_image3_base64 && (
                                <>
                                    <strong>Image 3:</strong><br />
                                    <img 
                                        style={{ border: "2px solid gray" }} 
                                        src={`data:image/jpeg;base64,${ad.top_banner_image3_base64}`} 
                                        alt="Image 3"  
                                    />
                                </>
                            )}
                            <h3>Lots Associated:</h3>
                            {ad.lots.length === 0 ? (
                                <h4>None</h4>
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
            ))}
            <p>*Delete and Edit functions removed for archived project</p>
        </div>
    );
};

export default AdAdmin;
