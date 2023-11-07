import styled, { css } from "styled-components";
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Footer from "../layouts/Footer"


const BrowseParkingLot = () => {
  const [businesses, setBusinesses] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const API_URL = process.env.REACT_APP_API_URL;
    axios.get(API_URL + 'lot/all')
      .then((res) => {
        console.log(res);
        const lots = res.data.map((lot) => ({
          name: lot.name,
          address: `${lot.city}, ${lot.state}${lot.zip ? ' ' + lot.zip : ''}`,
          url: lot.url_name,
        }));
        setBusinesses(lots);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const filteredBusinesses = businesses.filter((business) =>
    business.name.toLowerCase().includes(search.toLowerCase()) ||
    business.address.toLowerCase().includes(search.toLowerCase())
  );

  const handleClick = (urlName) => {
    let url = urlName[0];
    let name = urlName[1];
    if (name.includes('(fake lot)')) {
      navigate(`/fakelot/${url}`);
    } else {
      navigate(`/lot/${url}`);
    }
  };

  return (
    <>
      <BusinessListWrapper>
        <h2>Choose a Parking Lot</h2>
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search"
          style={{background:'#EEE', padding:'0.2em'}}
        />
        <ul>
          {filteredBusinesses.map((business, idx) => (
            <li key={`${business.name}-${idx}`}>
              <BusinessLink
                as="button"
                onClick={() => handleClick([business.url, business.name])}
                selected={business.name === search}
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