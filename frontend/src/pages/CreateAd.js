import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL;

const CreateAd = () => {
    const [adData, setAdData] = useState({
        name: '',
        start_date: '',
        end_date: '',
        business_id: '',
        url: '',
        top_banner_image1_path: null,
        top_banner_image2_path: null,
        image_change_interval: 10
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAdData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    }

    const handleImageUpload = (e, fieldName) => {
        setAdData((prevData) => ({
            ...prevData,
            [fieldName]: e.target.files[0]
        }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        Object.entries(adData).forEach(([key, value]) => {
            formData.append(key, value);
        });

        try {
            const response = await axios.post(API_URL + 'ads/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Ad created successfully');
        } catch (err) {
            toast.error('Error creating ad');
        }
    }

    return (
        <div style={{ height: '80vh' }}>
            <h1>Create Ad</h1>
            <form onSubmit={handleSubmit}>
                <input name="name" placeholder="Name" value={adData.name} onChange={handleChange} />
                <input name="start_date" type="date" value={adData.start_date} onChange={handleChange} />
                <input name="end_date" type="date" value={adData.end_date} onChange={handleChange} />
                <input name="business_id" placeholder="Business ID" value={adData.business_id} onChange={handleChange} />
                <input name="url" placeholder="URL" value={adData.url} onChange={handleChange} />
                <input type="file" onChange={(e) => handleImageUpload(e, 'top_banner_image1')} />
                <input type="file" onChange={(e) => handleImageUpload(e, 'top_banner_image2')} />
                <input name="image_change_interval" placeholder="Image Change Interval" value={adData.image_change_interval} onChange={handleChange} />
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}

export default CreateAd;