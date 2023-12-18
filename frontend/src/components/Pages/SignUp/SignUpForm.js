import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { NavLink } from 'react-router-dom';
import { Card, InputWrapper } from "../../Global.styled";
import ImageBlock from "../../Reusable components/ImageBlock";

const formInputs = [
    {
        label: "Company Name:",
        type: "text",
        name: "name",
        placeholder: "Enter Company Name",
    },
    {
        label: "Company Email ID:",
        type: "email",
        name: "email",
        placeholder: "Enter Company Email ID",
    },
    {
        label: "Contact No:",
        type: "tel",
        name: "phone_no",
        placeholder: "Contact No",
    },
    {
        label: "Address:",
        type: "text",
        name: "address",
        placeholder: "Address",
    },
    {
        label: "Password:",
        type: "password",
        name: "password",
        placeholder: "Enter Password",
    },
    {
        label: "Confirm Password:",
        type: "password",
        name: "confirm_password",
        placeholder: "Confirm Password",
    },
];

const SignUpForm = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const { register, handleSubmit, formState: { errors } } = useForm();

    useEffect(() => {
        setCurrentUser(window.location.pathname.split("/")[2].toUpperCase());
    }, [currentUser]);

    const onSubmit = data => {
        alert("This feature has been removed in archival version");
    };

    return (
        <SignUpCard>
            <ImageBlock className="logo" src={require("../../../assets/images/logo.png")} w="200px"/>
            <form onSubmit={handleSubmit(onSubmit)}>
                {formInputs.map(({label, type, placeholder, name}, idx) => (
                    <InputWrapper key={`${name}-${idx}`}>
                        <label htmlFor={name}>{label}</label>
                        <input 
                            type={type} 
                            {...register(name, {required: `${name} is required`})} 
                            placeholder={placeholder} 
                            id={name} 
                            name={name} 
                        />
                        {errors[name] && <span>{errors[name].message}</span>}
                    </InputWrapper>
                ))}
                <input type="submit" value="Submit" />
                <p>
                    Already Registered? <NavLink to="/login">Login Here</NavLink>
                </p>
            </form>
        </SignUpCard>
    );
};

const SignUpCard = styled(Card)`
    max-width: 500px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 40px;
    align-items: center;

    form {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 30px;
    }

    input[type='submit'] {
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

    p {
        margin-left: 10px;
        a {
            text-decoration: underline;
        }
    }
`;

export default SignUpForm;
