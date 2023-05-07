import {React, useEffect,useContext } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import MenuContext from '../MenuContext';

const Logout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {roleView, setRoleView } = useContext(MenuContext);


  useEffect(() => {
    localStorage.setItem("user_email", "");
    localStorage.setItem("user_role", "guest");
    localStorage.setItem("full_name", "");
    setRoleView("guest");
    dispatch({
      type: "SET_USER",
      payload: {
        email: "guest",
        role: "guest",
        fullName: "guest",
      },
    });
    navigate("/login");
  }, []);

  return (
    <>
      <h1>Successfully Logged Out</h1>
    </>
  );
};

export default Logout;

