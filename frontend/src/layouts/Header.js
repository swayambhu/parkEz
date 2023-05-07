import { NavLink } from "react-router-dom";
import styled from "styled-components";
import Navbar from "../components/Global Components/Navbar/Navbar";
import { useSelector } from "react-redux";
import { ImageWrapper } from "../components/Global.styled";
import { Header as StyledHeader } from "../components/Layout.styled";

const Header = () => {
  const userRole = useSelector((state) => state.user.role);

  return (
    <StyledHeader>
      <StyledNav className="flex-between">
        <div className="flex-left">
          <NavLink to="/">
            <ImageWrapper w="100px" h="auto">
              <img src={require('../assets/images/logo.png')} alt="logo" />
            </ImageWrapper>
          </NavLink>
        </div>
        <Navbar key={userRole} />
      </StyledNav>
    </StyledHeader>
    )
}

const StyledNav = styled.nav`
    gap: 30px;
    display: flex;
    align-items: center;

    ul{
        display: flex;
        align-items: center;
        gap: 12px;
        list-style: none;
        margin:0px;
    }

    ul li {
        cursor:pointer;
    }

    ul li:hover{
        background-color: #e0dede73;
    }

    ul a{
        text-decoration: none;
        color: #000000;
        font-size: 16px;
        cursor: pointer;
        display: block;
        padding: 15px 10px;
    }

    li > .active{
        border-bottom: 2px solid #000000;
    }

    ul li:last-child a{
        color: #ffffff;
        background-color: #0A0C8A;
        font-weight: 700;
        border-radius: 8px;
        padding: 7px 15px;
    }
    ul li:last-child:hover{
        background: none;
    }

    ul li:last-child a:hover{
        opacity: 0.8;
    }
    ul li:last-child a.active{
        border-bottom: none;
    }

    .active{
        color: #030ab2;
    }

    .flex-left{
        display:flex;
        align-items: center;
        gap: 10px;
    }
    
`
export default Header