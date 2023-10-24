import styled from "styled-components";
import ContactUs from "../components/Pages/Contact/ContactUs"
import Footer from "../layouts/Footer"

const Contact = () => {
    return(
        <>
        <Wrapper className="flex-center"> 
            <ContactUs />
        </Wrapper> 
        <Footer />
        </>
    )
}

 const Wrapper = styled.div`
    padding: 150px;
`
export default Contact
