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

const ErrorText = styled.span`
    color: red;
    font-size: 0.8em;
    margin-top: 0.2em;
    display: block;
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
  const [errors, setErrors] = useState({});
  const [userType, setUserType] = useState(null);

  const validateForm = () => {
      let tempErrors = {};

      const requiredFields = ['name', 'start_date', 'end_date', 'url', 'image_change_interval'];
      requiredFields.forEach(field => {
          if (!adData[field]) {
              tempErrors[field] = 'This field is required.';
          }
      });

      const namePattern = /^[A-Za-z0-9]{1,10}$/;
      if (adData.name && !namePattern.test(adData.name)) {
          tempErrors.name = 'Name must be 1-10 characters long and contain only uppercase, lowercase letters, and numbers.';
      }

      if (adData.start_date && adData.end_date && new Date(adData.start_date) >= new Date(adData.end_date)) {
          tempErrors.end_date = 'End date must be after start date.';
      }

      const interval = parseInt(adData.image_change_interval, 10);
      if (isNaN(interval) || interval <= 1 || interval >= 20) {
          tempErrors.image_change_interval = 'Interval must be a whole number between 2 and 19.';
      }

      const urlPattern = /^http(s)?:\/\/[^\s]*$/;
      if (adData.url && !urlPattern.test(adData.url)) {
          tempErrors.url = 'Invalid URL. Must start with http or https.';
      }

      if (adData.lots.length === 0) {
          tempErrors.lots = 'At least one lot should be selected.';
      }

      setErrors(tempErrors);
      return Object.keys(tempErrors).length === 0;
  };

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
          .catch((err) => {});
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

  const validateImage = (file, fieldName) => {
      return new Promise((resolve, reject) => {
          if (file.size > 500 * 1024) {
              reject(`${fieldName} must be less than 500KB.`);
              return;
          }

          if (file.name.split('.').pop().toLowerCase() !== 'jpg') {
              reject(`${fieldName} must have a .jpg extension.`);
              return;
          }

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

  const handleSubmit = async (e) => {
      e.preventDefault();

      if (!validateForm()) {
          return;
      }

      const formData = new FormData();
      Object.entries(adData).forEach(([key, value]) => {
          if (key === "lots") {
              formData.append('lot_ids', value.join(","));
          } else {
              formData.append(key, value);
          }
      });

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
                    {errors.name && <ErrorText>{errors.name}</ErrorText>}       
                </label>

                <label>
                    Current Start Date : <span><strong>{adData.start_date}</strong></span><em>(enter new date to update)</em><br/>
                    <Input name="start_date" type="date" value={adData.start_date} onChange={handleChange} />
                    {errors.start_date && <ErrorText>{errors.start_date}</ErrorText>}
                    <br />
                </label>

                <label>
                    Current End Date: <span><strong>{adData.end_date}</strong></span> <em>(enter new date to update)</em><br/>
                    <Input name="end_date" type="date" value={adData.end_date} onChange={handleChange} />
                    {errors.end_date && <ErrorText>{errors.end_date}</ErrorText>}
                </label>

                <label>
                    Current URL: <span><strong>{adData.url}</strong></span> <em>(enter new date to update)</em><br/>
                    <Input name="url" placeholder="Put new URL here to update" value={adData.url} onChange={handleChange} />
                    {errors.url && <ErrorText>{errors.url}</ErrorText>}
                </label> 
                <label>
                    Current Banner Image: <br />
                    {adData.top_banner_image1_base64 && 
                        <ImagePreview src={`data:image/jpeg;base64,${adData.top_banner_image1_base64}`} alt="Banner Image 1" />}
                     <br />Select new image to update: <Input type="file" onChange={(e) => handleImageUpload(e, 'top_banner_image1')} />
                     {errors.top_banner_image1 && <ErrorText>{errors.top_banner_image1}</ErrorText>}
                </label>

                <label>
                  Current Banner Image 2: <br />
                    {adData.top_banner_image2_base64 && 
                        <ImagePreview src={`data:image/jpeg;base64,${adData.top_banner_image2_base64}`} alt="Banner Image 2" />}
                     <br />Select new image to update: <Input type="file" onChange={(e) => handleImageUpload(e, 'top_banner_image2')} />

                </label>
                {errors.top_banner_image2 && <ErrorText>{errors.top_banner_image2}</ErrorText>}
                <label>
                  Current Banner Image 3: <br />
                    {adData.top_banner_image3_base64 && 
                        <ImagePreview src={`data:image/jpeg;base64,${adData.top_banner_image3_base64}`} alt="Banner Image 3" />}
                    <br />Select new image to update: <Input type="file" onChange={(e) => handleImageUpload(e, 'top_banner_image3')} />
                    {errors.top_banner_image3 && <ErrorText>{errors.top_banner_image3}</ErrorText>}                
                </label>
                <label>
                    Image Change Interval (seconds):
                    <Input name="image_change_interval" type="number" placeholder="Image Change Interval" value={adData.image_change_interval} onChange={handleChange} />
                    {errors.image_change_interval && <ErrorText>{errors.image_change_interval}</ErrorText>}
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
                {errors.associatedLots && <ErrorText>{errors.associatedLots}</ErrorText>}
                <Button type="submit">Submit</Button>
            </Form>
    </Container>
  );
}

export default EditAd;
