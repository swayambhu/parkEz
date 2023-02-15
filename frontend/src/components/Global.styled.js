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