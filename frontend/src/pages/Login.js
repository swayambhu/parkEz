import styled from "styled-components";
import LoginForm from "../components/Pages/Login/LoginForm";
import Footer from "../layouts/Footer"


const Login = () => {
    return(
    <>
        <Wrapper className="flex-center">
            <LoginForm />
        </Wrapper>
    <Footer />
    </>

    )
}

const Wrapper = styled.div`
    padding: 150px;
`

export default Login