import styled from "styled-components";

const Layout = styled.div`
    background-color: #ffffff;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: max-content 1fr max-content;
    min-height: 100vh;
    overflow: hidden;
`;

export default Layout;
