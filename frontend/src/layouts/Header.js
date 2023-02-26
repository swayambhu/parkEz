import styled from "styled-components";
import Navbar from "../components/Global Components/Navbar/Navbar";
import { Header as StyledHeader } from "../components/Layout.styled";

const Header = () => {
    
    return(
        <StyledHeader>
            <StyledNav className="flex-between">
                <Navbar/>
            </StyledNav>
        </StyledHeader>
    )
}

const StyledNav = styled.nav`
    gap: 30px;

    ul{
        display: flex;
        align-items: center;
        gap: 12px;
        list-style: none;
    }

    ul li {
        cursor:pointer;
    }

    ul li:hover{
        background-color: blue;
    }

    ul a{
        text-decoration: none;
        color: #000000;
        font-size: 16px;
        cursor: pointer;
        display: block;
        padding: 15px 10px;
    }
    
`
export default Header