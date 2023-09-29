import styled from "styled-components";
import {Card, InputWrapper} from '../../Global.styled'
import ImageBlock from "../../Reusable components/ImageBlock";
import { useForm } from "react-hook-form";
import {NavLink, useLocation} from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios"
import {getCurrentUserType, DOMAIN} from  "../../../utils/utils"
const LoginForm = () => {
    

    const location = useLocation()
    
    const currentUser = getCurrentUserType(location.pathname)
    

    const { register, handleSubmit, formState: {errors} } = useForm({defaultValues: {}});
    const loginSubmit = data => {
        const {Email: username, Password: password} = data
        data = {username, password, user_type: currentUser.toUpperCase()}
        console.log(data)
        
        axios.post(`${DOMAIN}/auth/login`, data
        ).then((res) => {
            toast.success('Logged in successfully')
        }).catch((err) => {
            toast.error(err.response.data.detail)
        })
    }
    const formInputs = [
        {
            label: "Company Email ID:",
            type: "email",
            name:"Email",
            placeholder: "Enter Company Email ID",

        },
        {
            label: "Password:",
            type: "password",
            name:"Password",
            placeholder: "Enter Password",
        },
    ]
    return(
        <LoginFormCard className="flex-center">
            
            <NavLink to="/">
                <ImageBlock className="logo" src={require("../../../assets/images/logo.png")} w="150px"/>
            </NavLink>
            <form onSubmit={handleSubmit((data) =>loginSubmit(data))}>
                {formInputs.map(({label, type, name, placeholder}, idx) => (
                    <InputWrapper key={`${name}-idx`}>
                        <label htmlFor={name}>{label}*</label>
                        <input type={type} {...register(name, {required: `${name} is required`} )} placeholder={placeholder} />
                        {errors[name] && <span>{errors[name].message}</span>}
                    </InputWrapper>
                ))}

                <div>
                    <input type="submit" value="Submit" />  
                    <div>
                        <div className="flex-center">
                            <input type="checkbox" id="remember_me" name="remember_me"/> <label htmlFor="remember_me">Remember Me</label>
                        </div>
                        <NavLink to="#">
                            Forgot Password?
                        </NavLink>
                    </div>
                </div>
                {
                    currentUser !== "employee" && 
                    <p>
                        Don't have an account? <NavLink to={`/sign-up/${currentUser}/`}>Register Here</NavLink>
                    </p>
                }
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

    input[type="submit"]{
        margin-bottom: 7px;
    }

    span{
        margin-bottom: -12px;
    }

    input[type="submit"] ~ div{
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0px 10px;

        div{
            gap: 5px;
        }

        input[type="checkbox"]{
            width: 15px;
            height: 15px;
        }

        a{
            text-decoration: underline;
            text-transform: capitalize;
        }
    }
`
export default LoginForm
