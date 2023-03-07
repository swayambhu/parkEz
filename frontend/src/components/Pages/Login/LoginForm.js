import styled from "styled-components";
import {Card, InputWrapper} from '../../Global.styled'
import ImageBlock from "../../Reusable components/ImageBlock";
import { useForm } from "react-hook-form";
import {NavLink} from 'react-router-dom';
const LoginForm = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const onSubmit = data => console.log(data);
    console.log(watch("example"));

    const formInputs = [
        {
            label: "Company Email ID:",
            type: "email",
            placeholder: "Enter Company Email ID",
        },
        {
            label: "Password:",
            type: "password",
            placeholder: "Enter Password",
        },
    ]
    return(
        <LoginFormCard className="flex-center">
            <ImageBlock className="logo" src={require("../../../assets/images/logo.png")} w="150px"/>
            <form onSubmit={handleSubmit(onSubmit)}>
                {formInputs.map(({label, type, placeholder}, idx) => (
                    <InputWrapper>
                        <label>{label}</label>
                        <input type={type} {...register("exampleRequired", { required: true })} placeholder={placeholder} /> 
                        {errors.exampleRequired && <span>This field is required</span>}
                    </InputWrapper>
                ))}

                <input type="submit" value="Submit" />
                <p>
                    Don't have an account? <NavLink to="/sign-up">Register Here</NavLink>
                </p>
            </form>
        </LoginFormCard>
    )
}
const LoginFormCard = styled(Card)`
    padding: 40px 60px;
    width: 500px;
    flex-direction: column;
    gap: 40px;

    form{
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 30px;
    }

    input[type='submit']{
        padding: 15px 30px;
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-weight: 500;
        background-color: #080963;
        border-radius: 15px;
        cursor: pointer;
        text-transform: uppercase;
    }

    p{
        margin-left: 10px;
        a{
            text-decoration: underline;
        }
    }
`
export default LoginForm
