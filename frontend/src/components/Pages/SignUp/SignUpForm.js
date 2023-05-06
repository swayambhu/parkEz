import styled from "styled-components";
import { Card } from "../../Global.styled";
import { useForm } from "react-hook-form";
import ImageBlock from "../../Reusable components/ImageBlock";
import { NavLink } from "react-router-dom";
import axios from "axios";


const SignUpForm = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const onSubmit = async (data) => {
        console.log('gets here');
      try {
        const response = await axios.post('http://localhost:8000/signup', {
          name: data.name,
          email: data.email,
          contact_no: data.contact_no,
          address: data.address,
          password: data.password,
          confirm_password: data.confirm_password,
          accountType: data.accountType,
        });
        console.log(response);
        if (response.data.message) {
          alert(response.data.message);
        }
      } catch (error) {
        if (error.response && error.response.data.detail) {
          alert(error.response.data.detail);
        } else {
          alert('An error occurred while submitting the form.');
        }
      }
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
  ];
  return (
    <SignUpCard>
      <ImageBlock
        className="logo"
        src={require("../../../assets/images/logo.png")}
        w="200px"
      />
      <form onSubmit={handleSubmit(onSubmit)}>
      {formInputs.map(({ label, type, placeholder, name }, idx) => (
        <InputWrapper key={`${name}-${idx}`}>
            <label htmlFor={name}>{label}</label>
            <input
            type={type}
            {...register(name, { required: true })}
            placeholder={placeholder}
            id={name}
            name={name}
            />
            {errors[name] && <span>This field is required</span>}
        </InputWrapper>
        ))}

        <InputWrapper>
          <label htmlFor="accountType">Account Type:</label>
          <div>
          &nbsp;&nbsp;&nbsp;<input
              type="radio"
              id="parking_lot_operator"
              name="accountType"
              value="parking_lot_operator"
              {...register("accountType", { required: true })}
            />
            <label htmlFor="parking_lot_operator">&nbsp;&nbsp;Parking Lot Operator</label>
          </div>
          <div>
          &nbsp;&nbsp;&nbsp;<input
              type="radio"
              id="advertiser"
              name="accountType"
              value="advertiser"
              {...register("accountType", { required: true })}
            />
            <label htmlFor="advertiser">&nbsp;&nbsp;Advertiser</label>
          </div>
          {errors.accountType && <span>This field is required</span>}
        </InputWrapper>
        <input type="submit" value="Submit" />
        <p>
          Already Registered? <NavLink to="/login">Login Here</NavLink>
        </p>
      </form>
    </SignUpCard>
  );
};

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-weight: 500;
  }

  input {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
  }

  span {
    color: red;
    font-size: 14px;
  }
`;


const SignUpCard = styled(Card)`
  max-width: 500px;
  margin: 0px auto;
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

  input[type="submit"] {
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