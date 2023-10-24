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

const ImagePreview = styled.img`
    border: 1px solid grey;
    max-width: 100%;
    margin-bottom: 1em;
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
    lots: []
  });

  const [businesses, setBusinesses] = useState([]);
  const [userType, setUserType] = useState(null);

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
        const lotIDs = res.data.ad.lots.map(lot => parseInt(lot.id));
        console.log(lotIDs);
        setAdData({
          ...res.data.ad,
          lots: lotIDs
        });
      })
      .catch(err => {
        console.error(err);
        toast.error('Error fetching ad details', {
          autoClose: 3000
        });
      });    
  }, [id]);
  useEffect(() => {
    axios.get(API_URL + "auth/me", { withCredentials: true })
    .then((res) => {
        setUserType(res.data.entitlement_category);
    })
    .catch((err) => {
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
  const value = Number(e.target.value); 
  const { checked } = e.target;

  if (checked) {
      setAdData((prevData) => ({
          ...prevData,
          lots: [...prevData.lots, value]
      }));
  } else {
      setAdData((prevData) => ({
          ...prevData,
          lots: prevData.lots.filter(lot => lot !== value)
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
      if (key === "lots") {
          formData.append('lot_ids', value.join(","));
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
      let success_url = '/ad-admin';
      if (userType == 'ADVERTISERS'){
        success_url = '/dashboard';
      }
      toast.success('Ad updated successfully', {
        autoClose: 3000,
        onClose: () => {
          window.location.href = success_url;
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
                    Current Name: <span><strong>{adData.name}</strong></span><em>(enter new name to update)</em><br/>
                    <Input name="name" placeholder="Put new name here to update" value={adData.name} onChange={handleChange} />
                </label>

                <label>
                    Current Start Date : <span><strong>{adData.start_date}</strong></span><em>(enter new date to update)</em><br/>
                    <Input name="start_date" type="date" value={adData.start_date} onChange={handleChange} />
                    <br />
                </label>

                <label>
                    Current End Date: <span><strong>{adData.end_date}</strong></span> <em>(enter new date to update)</em><br/>
                    <Input name="end_date" type="date" value={adData.end_date} onChange={handleChange} />
                </label>

                <label>
                    Current URL: <span><strong>{adData.url}</strong></span> <em>(enter new date to update)</em><br/>
                    <Input name="url" placeholder="Put new URL here to update" value={adData.url} onChange={handleChange} />
                </label> 
                <label>
                    Current Banner Image: <br />
                    {adData.top_banner_image1_base64 && 
                        <ImagePreview src={`data:image/jpeg;base64,${adData.top_banner_image1_base64}`} alt="Banner Image 1" />}
                     <br />Select new image to update: <Input type="file" onChange={(e) => handleImageUpload(e, 'top_banner_image1')} />
                </label>

                <label>
                  Current Banner Image 2: <br />
                    {adData.top_banner_image2_base64 && 
                        <ImagePreview src={`data:image/jpeg;base64,${adData.top_banner_image2_base64}`} alt="Banner Image 2" />}
                     <br />Select new image to update: <Input type="file" onChange={(e) => handleImageUpload(e, 'top_banner_image2')} />
                </label>

                <label>
                  Current Banner Image 3: <br />
                    {adData.top_banner_image3_base64 && 
                        <ImagePreview src={`data:image/jpeg;base64,${adData.top_banner_image3_base64}`} alt="Banner Image 3" />}
                    <br />Select new image to update: <Input type="file" onChange={(e) => handleImageUpload(e, 'top_banner_image3')} />
                </label>
                <label>
                    Image Change Interval (seconds):
                    <Input name="image_change_interval" type="number" placeholder="Image Change Interval" value={adData.image_change_interval} onChange={handleChange} />
                </label>
                <h2>Associate Ad with Lots:</h2>
                <ul>
                  {businesses.map((business, idx) => (
                    <li key={`${business.name}-${idx}`}>
                      {console.log(business)}
                        <label>
                        <input
                            type="checkbox"
                            value={parseInt(business.id)}  // Convert string to integer
                            checked={adData.lots.includes(parseInt(business.id))}  // Convert string to integer
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
