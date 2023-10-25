import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import styled from 'styled-components';

const API_URL = process.env.REACT_APP_API_URL;

const Container = styled.div`
    height: 95vh;
    padding: 3em;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const Form = styled.form`
    display: grid;
    gap: 1em;
    width: 100%;
    max-width: 1000px;
`;

const Input = styled.input`
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 100%;
`;

const Select = styled.select`
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 100%;
`;

const Address = styled.span`
    font-size: 0.9em;
    color: grey;
`;

const Button = styled.button`
    padding: 10px 20px;
    margin-bottom: 3em;
    background-color: #007BFF;
    color: #FFF;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: #0056b3;
    }
`;

const ErrorText = styled.span`
    color: red;
    font-size: 0.8em;
    margin-top: 0.2em;
    display: block;
`;

const AdminCreateAd = () => {
    const [adData, setAdData] = useState({
        name: '',
        start_date: '',
        end_date: '',
        url: '',
        top_banner_image1_path: null,
        top_banner_image2_path: null,
        top_banner_image3_path: null,
        image_change_interval: 3,
        associatedLots: []
    });
    const [lots, setLots] = useState([]);
    const [businesses, setBusinesses] = useState([]);
    const [selectedBusinessId, setSelectedBusinessId] = useState(null);

    useEffect(() => {
        axios.get(API_URL + "ads/get_advertisers", { withCredentials: true })
            .then((res) => {
                setBusinesses(res.data.businesses);
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);

    const [errors, setErrors] = useState({associatedLots: undefined}); 

    const validateForm = () => {
        let tempErrors = {};

        // Checking for empty fields
        const requiredFields = ['name', 'start_date', 'end_date', 'url', 'top_banner_image1', 'top_banner_image2', 'top_banner_image3', 'image_change_interval'];
        requiredFields.forEach(field => {
            if (!adData[field]) {
                tempErrors[field] = 'This field is required.';
            }
        });

        // Name validation
        const namePattern = /^[A-Za-z0-9]{1,10}$/;
        if (adData.name && !namePattern.test(adData.name)) {
            tempErrors.name = 'Name must be 1-10 characters long and contain only uppercase, lowercase letters, and numbers.';
        }

        // Start date must be before end date
        if (adData.start_date && adData.end_date && new Date(adData.start_date) >= new Date(adData.end_date)) {
            tempErrors.end_date = 'End date must be after start date.';
        }

        // Image change interval validation
        const interval = parseInt(adData.image_change_interval, 10);
        if (isNaN(interval) || interval <= 1 || interval >= 20) {
            tempErrors.image_change_interval = 'Interval must be a whole number between 2 and 19.';
        }

        // URL validation
        const urlPattern = /^http(s)?:\/\/[^\s]*$/;
        if (adData.url && !urlPattern.test(adData.url)) {
            tempErrors.url = 'Invalid URL. Must start with http or https.';
        }

        if (adData.associatedLots.length === 0) {
            tempErrors.associatedLots = 'At least one lot should be selected.';
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;  // Return true if no errors
    };

    useEffect(() => {
        axios.get(API_URL + "lot/all")
            .then((res) => {
                setLots(res.data);
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setAdData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleLotCheckboxChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setAdData((prevData) => ({
                ...prevData,
                associatedLots: [...prevData.associatedLots, value]
            }));
        } else {
            setAdData((prevData) => ({
                ...prevData,
                associatedLots: prevData.associatedLots.filter(lot => lot !== value)
            }));
        }
    };

    const handleImageUpload = async (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            await validateImage(file, fieldName);
            setAdData(prevData => ({ ...prevData, [fieldName]: file }));
            setErrors(errors => ({ ...errors, [fieldName]: undefined }));
        } catch (error) {
            setErrors(errors => ({ ...errors, [fieldName]: error }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedBusinessId) {
            toast.error('Please select an advertiser business', {
                autoClose: 3000
            });
            return;
        }
        if (!validateForm()) {
            return;  
        }    

        const formData = new FormData();
        Object.entries(adData).forEach(([key, value]) => {
            if (key === "associatedLots") {
                value.forEach(lotId => {
                    formData.append('lot_ids', lotId);
                });
            } else {
                formData.append(key, value);
            }
        });

        try {
            const response = await axios.post(API_URL + `ads/staff_ad_create/${selectedBusinessId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });
            toast.success('Ad created successfully', {
                autoClose: 3000,
                onClose: () => {
                    window.location.href = "/ad-admin";
                }
            });
        } catch (err) {
            toast.error('Error creating ad', {
                autoClose: 3000
            });
        }
    };

    const validateImage = (file, fieldName) => {
        return new Promise((resolve, reject) => {
            // Validate file size
            if (file.size > 500 * 1024) { // 500KB
                reject(`${fieldName} must be less than 500KB.`);
                return;
            }

            // Validate file extension
            if (file.name.split('.').pop().toLowerCase() !== 'jpg') {
                reject(`${fieldName} must have a .jpg extension.`);
                return;
            }

            // Validate image dimensions
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                if (img.width > 1000 || img.height > 200) {
                    reject(`${fieldName} must have a width of no more than 1000px and a height of no more than 200px.`);
                    return;
                }
                resolve();
            };
            img.onerror = () => {
                reject(`${fieldName} loading failed.`);
            };
        });
    };

    return (
        <Container>
            <h1>Create Ad for Advertiser</h1>
            <Form onSubmit={handleSubmit}>
                <label>
                    Select Advertiser:
                    <Select value={selectedBusinessId} onChange={(e) => setSelectedBusinessId(e.target.value)}>
                        <option value="">--Select an Advertiser--</option>
                        {businesses.map((business) => (
                            <option key={business.id} value={business.id}>
                                {business.name}
                            </option>
                        ))}
                    </Select>
                </label>
                <label>
                    Name:
                    <Input name="name" placeholder="Name" value={adData.name} onChange={handleChange} />
                    {errors.name && <ErrorText>{errors.name}</ErrorText>}
                </label>
                <label>
                    Start Date:
                    <Input name="start_date" type="date" value={adData.start_date} onChange={handleChange} />
                    {errors.start_date && <ErrorText>{errors.start_date}</ErrorText>}
                </label>
                <label>
                    End Date:
                    <Input name="end_date" type="date" value={adData.end_date} onChange={handleChange} />
                    {errors.end_date && <ErrorText>{errors.end_date}</ErrorText>}
                </label>
                <label>
                    URL:
                    <Input name="url" placeholder="URL" value={adData.url} onChange={handleChange} />
                    {errors.url && <ErrorText>{errors.url}</ErrorText>}
                </label>
                <label>
                    Top Banner Image 1:
                    <Input type="file" onChange={(e) => handleImageUpload(e, 'top_banner_image1')} />
                    {errors.top_banner_image1 && <ErrorText>{errors.top_banner_image1}</ErrorText>}
                </label>
                <label>
                    Top Banner Image 2:
                    <Input type="file" onChange={(e) => handleImageUpload(e, 'top_banner_image2')} />
                    {errors.top_banner_image2 && <ErrorText>{errors.top_banner_image2}</ErrorText>}
                </label>
                <label>
                    Top Banner Image 3:
                    <Input type="file" onChange={(e) => handleImageUpload(e, 'top_banner_image3')} />
                    {errors.top_banner_image3 && <ErrorText>{errors.top_banner_image3}</ErrorText>}
                </label>
                <label>
                    Image Change Interval (seconds):
                    <Input name="image_change_interval" type="number" placeholder="Image Change Interval" value={adData.image_change_interval} onChange={handleChange} />
                    {errors.image_change_interval && <ErrorText>{errors.image_change_interval}</ErrorText>}
                </label>
                <h2>Associate Ad with Lots:</h2>
                <ul>
                    {lots.map((lot, idx) => (
                        <li key={`${lot.name}-${idx}`}>
                            <label>
                                <input
                                    type="checkbox"
                                    value={lot.id} 
                                    onChange={handleLotCheckboxChange}
                                />
                                <strong>&nbsp; {lot.name}</strong> - <Address>{`${lot.city}, ${lot.state}${lot.zip ? ' ' + lot.zip : ''}`}</Address>
                            </label>
                        </li>
                    ))}
                </ul>
                {errors.associatedLots && <ErrorText>{errors.associatedLots}</ErrorText>}
                <Button type="submit">Submit</Button>
            </Form>
        </Container>
    )
}

export default AdminCreateAd;
