import axios from 'axios';
import styled from "styled-components";
import { Card, InputWrapper } from '../../Global.styled'
import ImageBlock from "../../Reusable components/ImageBlock";
import { useForm } from "react-hook-form";
import React, { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from "react-redux";
import MenuContext from '../../../MenuContext';


const LoginForm = () => {
    const { roleView, setRoleView } = useContext(MenuContext);


    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const [records, setRecords] = useState([]);
    const navigate = useNavigate();



    useEffect(() => {
        fetch("http://localhost:8000/auth_records")
            .then((response) => response.json())
            .then((data) => setRecords(data));
    }, []);

    const dispatch = useDispatch();

    const onSubmit = async (data) => {
      try {
        const response = await axios.post(
          "http://localhost:8000/authenticate",
          data
        );
        console.log(response);
        if (response.data.password_valid) {
          localStorage.setItem("user_email", response.data.username);
          localStorage.setItem("user_role", response.data.userrole);
          localStorage.setItem("full_name", response.data.fullname);
          setRoleView(response.data.userrole);
          dispatch({
            type: "SET_USER",
            payload: {
              email: response.data.username,
              role: response.data.userrole,
              fullName: response.data.fullname,
            },
          });
          navigate("/dashboard");
        }
      } catch (error) {
        console.error(error);
      }
    };
        
  
    const formInputs = [
        {
            label: "Company Email ID:",
            type: "email",
            name: "email",
            placeholder: "Enter Company Email ID",
        },
        {
            label: "Password:",
            type: "password",
            name: "password",
            placeholder: "Enter Password",
        },
    ]
    return (
        <LoginFormCard className="flex-center">
            <Link to="/">
                <ImageBlock className="logo" src={require("../../../assets/images/logo.png")} w="150px" />
            </Link>
            <form onSubmit={handleSubmit(onSubmit)}>
                {formInputs.map(({ label, type, name, placeholder }, idx) => (
                    <InputWrapper key={`${name}-idx`}>
                        <label htmlFor={name}>{label}</label>
                        <input type={type} {...register(name, { required: true })} placeholder={placeholder} id={name} name={name} />
                        {errors[name] && <span>This field is required</span>}
                    </InputWrapper>
                ))}

                <div>
                    <input type="submit" value="Submit" />
                    <div>
                        <div className="flex-center">
                            <input type="checkbox" id="remember_me" name="remember_me" /> <label htmlFor="remember_me">Remember Me</label>
                        </div>
                        <Link to="#">
                            Forgot Password?
                        </Link>
                    </div>
                </div>
                <p>
                    Don't have an account? <Link to="/sign-up">Register Here</Link>
                </p>
            </form>
            <h1>Possible Logins</h1>
            <Table>
                <thead>
                    <tr>
                        <Th>Username</Th>
                        <Th>Password</Th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((record, i) => (
                        <tr key={i}>
                            <Td>{record.username}</Td>
                            <Td>{record.password}</Td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </LoginFormCard>
    )
}


const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 1.2rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 8px;
  background-color: #f2f2f2;
  border: 1px solid #ddd;
`;

const Td = styled.td`
  text-align: left;
  padding: 8px;
  border: 1px solid #ddd;
`;

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
