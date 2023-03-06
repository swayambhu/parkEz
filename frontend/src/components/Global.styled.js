import styled from 'styled-components'


const Flex = styled`
    display: flex;
`

const FlexCenter = styled(Flex)`
    align-items: center;
    justify-content: center;
`
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

export const Button = styled(FlexCenter).button`
    padding: 7px 20px;
    
`