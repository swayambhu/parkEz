import styled from "styled-components";
import {Card, InputWrapper} from '../../Global.styled'
import ImageBlock from "../../Reusable components/ImageBlock";
import { useForm } from "react-hook-form";
import {NavLink} from 'react-router-dom';
const contactus = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const onSubmit = data => console.log(data);
    console.log(watch("example"));

    const formInputs = [
        {
            label: "Company Email ID:",
            type: "email",
            name:"email",
            placeholder: "Enter Company Email ID",
        },
        {
            label: "Password:",
            type: "password",
            name:"password",
            placeholder: "Enter Password",
        },
    ]
    return(
        <contactusCard className="flex-center">
            <NavLink to="/">
                <ImageBlock className="logo" src={require("../../../assets/images/logo.png")} w="150px"/>
            </NavLink>
            <form onSubmit={handleSubmit(onSubmit)}>
                {formInputs.map(({label, type, name, placeholder}, idx) => (
                    <InputWrapper key={`${name}-idx`}>
                        <label htmlFor={name}>{label}</label>
                        <input type={type} {...register("exampleRequired", { required: true })} placeholder={placeholder} id={name} name={name}/> 
                        {errors.exampleRequired && <span>This field is required</span>}
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
                <p>
                    Don't have an account? <NavLink to="/sign-up">Register Here</NavLink>
                </p>
            </form>
        </contactusCard>
    )
}
const LoginForcontactusCardmCard = styled(Card)`
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
export default contactus
