import styled from 'styled-components'

export const ImageWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${({ w }) => w ?? "100px"};
    height: ${({ h }) => h ?? "100px"};

    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
`

export const Button = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${({pd}) => pd ?? "7px 15px"};
    border-radius: 10px;
    cursor: pointer;
    &:hover{
        opacity: 0.8;
    }
`

export const HeroSection = styled.section`
    background-image:linear-gradient(rgba(0, 0, 0, 0.5),rgba(0, 0, 0, 0.5)), url(${({ image }) => image});
    background-repeat: no-repeat, repeat;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    padding: 65px 150px;
    width: 100%;
`