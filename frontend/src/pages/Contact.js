import styled from "styled-components";
import contactus from "../components/Pages/Contact/contactus";

const Contact = () => {
    return(
        <>
        <Wrapper className="flex-center"> 
            <contactus />
        </Wrapper> 
            
        </>
    )
}

 const Wrapper = styled.div`
    padding: 150px;
`
export default Contact
