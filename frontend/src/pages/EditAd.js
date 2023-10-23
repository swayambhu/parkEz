import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
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

const EditAd = () => {
  const { id } = useParams();

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

  const [businesses, setBusinesses] = useState([]);

  useEffect(() => {
    axios.get(API_URL + "lot/all")
      .then((res) => {
        setBusinesses(res.data);
      })
      .catch((err) => {
        console.error(err);
      });

      axios.get(API_URL + `ads/details/${id}`, { withCredentials: true })
      .then(res => {
        setAdData(res.data);
      })
      .catch(err => {
        console.error(err);
        toast.error('Error fetching ad details', {
          autoClose: 3000
        });
      });
  }, [id]);

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

const handleImageUpload = (e, fieldName) => {
    setAdData((prevData) => ({
        ...prevData,
        [fieldName]: e.target.files[0]
    }));
};

  const handleSubmit = async (e) => {
    e.preventDefault();

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
    console.log(formData);
    try {
      const response = await axios.put(API_URL + `ads/update/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      toast.success('Ad updated successfully', {
        autoClose: 3000,
        onClose: () => {
          window.location.href = "/dashboard";
        }
      });
    } catch (err) {
      toast.error('Error updating ad', {
        autoClose: 3000
      });
    }
  };

  return (
    <Container>
      <h1>Edit Ad</h1>
      <Form onSubmit={handleSubmit}>
                <label>
                    Name:
                    <Input name="name" placeholder="Name" value={adData.name} onChange={handleChange} />
                </label>
                <label>
                    Start Date:
                    <Input name="start_date" type="date" value={adData.start_date} onChange={handleChange} />
                </label>
                <label>
                    End Date:
                    <Input name="end_date" type="date" value={adData.end_date} onChange={handleChange} />
                </label>
                <label>
                    URL:
                    <Input name="url" placeholder="URL" value={adData.url} onChange={handleChange} />
                </label>
                <label>
                    Top Banner Image 1:
                    <Input type="file" onChange={(e) => handleImageUpload(e, 'top_banner_image1')} />
                </label>
                <label>
                    Top Banner Image 2:
                    <Input type="file" onChange={(e) => handleImageUpload(e, 'top_banner_image2')} />
                </label>
                <label>
                    Top Banner Image 3:
                    <Input type="file" onChange={(e) => handleImageUpload(e, 'top_banner_image3')} />
                </label>
                <label>
                    Image Change Interval (seconds):
                    <Input name="image_change_interval" type="number" placeholder="Image Change Interval" value={adData.image_change_interval} onChange={handleChange} />
                </label>
                <h2>Associate Ad with Lots:</h2>
                <ul>
                    {businesses.map((business, idx) => (
                        <li key={`${business.name}-${idx}`}>
                            <label>
                                <input
                                    type="checkbox"
                                    value={business.id} 
                                    onChange={handleLotCheckboxChange}
                                />
                                <strong>&nbsp; {business.name}</strong> - <Address>{`${business.city}, ${business.state}${business.zip ? ' ' + business.zip : ''}`}</Address>
                            </label>
                        </li>
                    ))}
                </ul>


                <Button type="submit">Submit</Button>
            </Form>
    </Container>
  );
}

export default EditAd;
