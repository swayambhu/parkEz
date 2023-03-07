import styled from "styled-components"
import { Card, InputWrapper } from "../../Global.styled";
import { useForm } from "react-hook-form";
import ImageBlock from "../../Reusable components/ImageBlock";
import {NavLink} from 'react-router-dom';

const SignUpForm = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const onSubmit = data => console.log(data);
    console.log(watch("example"));

    const formInputs = [
        {
            label: "Company Name:",
            type: "text",
            placeholder: "Enter Company Name",
        },
        {
            label: "Company Email ID:",
            type: "email",
            placeholder: "Enter Company Email ID",
        },
        {
            label: "Contact No:",
            type: "tel",
            placeholder: "Contact No",
        },
        {
            label: "Address:",
            type: "text",
            placeholder: "Address",
        },
        {
            label: "Password:",
            type: "password",
            placeholder: "Enter Password",
        },
        {
            label: "Confirm Password:",
            type: "password",
            placeholder: "Confirm Password",
        },
    ]
    return(
        <SignUpCard>
            <ImageBlock className="logo" src={require("../../../assets/images/logo.png")} w="200px"/>
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
                    Already Registered? <NavLink to="/login">Login Here</NavLink>
                </p>
            </form>
        </SignUpCard>
    )
}

const SignUpCard = styled(Card)`
    max-width: 500px;
    margin: 0px auto;
    display: flex;
    flex-direction: column;
    gap: 40px;
    align-items: center;
   

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




export default SignUpForm