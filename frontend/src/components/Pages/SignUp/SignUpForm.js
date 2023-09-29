import styled from "styled-components"
import { Card, InputWrapper } from "../../Global.styled";
import { useForm } from "react-hook-form";
import ImageBlock from "../../Reusable components/ImageBlock";
import {NavLink, useLocation} from 'react-router-dom';
import { toast } from "react-toastify";
import axios from "axios"
import { useState } from "react";
import { useEffect } from "react";
import {getCurrentUserType, DOMAIN} from "../../../utils/utils"

const SignUpForm = () => {

    const [currentUser, setcurrentUser] = useState(null);
    const { register, handleSubmit,control, formState: { errors } } = useForm();
    const location = useLocation()
    useEffect(() => {
        const userType = getCurrentUserType(location.pathname)
        setcurrentUser(userType)
    }, []);

    const onSubmit = data => {
        const {email, name, contact_no: phone_no, address, password, confirm_password} = data
       
        const data_dict = {
            email, 
            name,
            phone_no,
            address,
            password,
            type: currentUser
        }

        if (password !== confirm_password){
            toast.error('Password shall match confirm password')
            return
        }

        axios.post(`${DOMAIN}/business/create`, data_dict)
        .then(res => {
            toast.success('Business registered Successfully!🚀')
        })
        .catch(err => toast.error(err.response.data.detail))
    };
    

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
            name: "contact_no",
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
    ]
    return(
        <SignUpCard>
            <ImageBlock className="logo" src={require("../../../assets/images/logo.png")} w="200px"/>
            <form onSubmit={handleSubmit(onSubmit)}>
                {formInputs.map(({label, type, placeholder, name}, idx) => (
                    <InputWrapper key={`${name}-${idx}`}>
                        <label htmlFor={name}>{label}</label>
                        <input type={type} {...control} {...register(name, {required: `${name} is required`})} placeholder={placeholder} id={name} name={name}/> 
                        {errors[name] && <span>{errors[name].message}</span>}
                    </InputWrapper>
                ))}

                <input type="submit" value="Submit" />
                <p>
                    Already Registered? <NavLink to={`/login/${currentUser?.toLowerCase()}`}>Login Here</NavLink>
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