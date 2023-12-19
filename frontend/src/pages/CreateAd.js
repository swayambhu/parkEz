import React, { useState } from 'react';
import styled from 'styled-components';

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

const CreateAd = () => {
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
    const [businesses, setBusinesses] = useState([]); // This can be hardcoded or removed if not needed
    const [errors, setErrors] = useState({associatedLots: undefined}); 

    const validateForm = () => {
        let tempErrors = {};
        // Validation logic here
        // ...
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAdData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleLotCheckboxChange = (e) => {
        const { value, checked } = e.target;
        // Checkbox handling logic here
    };

    const handleImageUpload = (e, fieldName) => {
        const file = e.target.files[0];
        // Image upload handling logic here
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            alert("This feature has been removed in the archived version of the website");
        }
    };

    // Removed useEffects and other backend related logic

    return (
        <Container>
            <h1>Create Ad</h1>
            <Form onSubmit={handleSubmit}>
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
        {errors.associatedLots && <ErrorText>{errors.associatedLots}</ErrorText>}
                <Button type="submit">Submit</Button>
            </Form>
        </Container>
    );
}

export default CreateAd;
