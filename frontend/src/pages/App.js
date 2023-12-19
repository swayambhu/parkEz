import React from 'react';
import {Main } from '../components/Layout.styled';
import Header from "../layouts/Header"
import Router from '../routes/Router';
import { ToastContainer } from 'react-toastify';

function App() {
  console.clear();
  return (
    <>
      <ToastContainer />
      <Header />
      <Main>
        <Router />
      </Main>
    </>
  );
}

export default App;
