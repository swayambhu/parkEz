import styled, { css } from "styled-components";
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from 'axios';
import Footer from "../layouts/Footer"

const BrowseParkingLot = () => {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  useEffect(() => {
    const API_URL = process.env.REACT_APP_API_URL;
    axios.get(API_URL + "lot/all")
      .then((res) => {
        const lots = res.data.map(lot => ({
          name: lot.name,
          address: `${lot.city}, ${lot.state}${lot.zip ? ' ' + lot.zip : ''}`
        }));
        setBusinesses(lots);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleClick = (business) => {
    setSelectedBusiness(business);
    setTimeout(() => setSelectedBusiness(null), 300);
  };

  return (
    <>
      <BusinessListWrapper>
        <h2>Choose a Parking Lot</h2>
        <ul>
          {businesses.map((business, idx) => (
            <li key={`${business.name}-${idx}`}>
              <BusinessLink
                as="button"
                onClick={() => handleClick(business.name)}
                selected={selectedBusiness === business.name}
              >
                {business.name}
                <br />
                <Address>{business.address}</Address>
              </BusinessLink>
            </li>
          ))}
        </ul>
      </BusinessListWrapper>
      <br /><br />
      <Footer />
    </>
  );
};

const BusinessListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 400px;
  min-height: 80vh;
  margin: 0 auto;

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    margin-bottom: 10px;
  }
  
  h2 {
    font-size: 1.3rem;
    font-weight: 600;
    text-transform: uppercase;
    color: rgb(10, 12, 138);
    text-align: center;
    padding-top:35px;
    padding-bottom:10px;
  }
`;

const fadeInOut = css`
  @keyframes fadeInOut {
    0% {
      background-color: #ffffff;
      color: #080963;
    }
    50% {
      background-color: #080963;
      color: #ffffff;
    }
    100% {
      background-color: #ffffff;
      color: #080963;
    }
  }
`;


const BusinessLink = styled(NavLink)`
  padding: 10px 20px;
  background-color: #ffffff;
  color: #080963;
  border: 1px solid #080963;
  border-radius: 15px;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  width: 100%;
  display: block;

  ${({ selected }) => selected && fadeInOut}
  animation: ${({ selected }) => (selected ? "fadeInOut 0.3s" : "none")};

  &:hover {
    background-color: #080963;
    color: #ffffff;
    transition: background-color 0.3s, color 0.1s;
  }
`;

const Address = styled.span`
  font-size: 0.8rem;
  display: block;
  margin-top: 5px;
`;

export default BrowseParkingLot;