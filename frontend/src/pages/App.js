import React from 'react';
import {Main } from '../components/Layout.styled';
import Header from "../layouts/Header"
import Footer from "../layouts/Footer"
import Router from '../routes/Router';
import { ToastContainer } from 'react-toastify';
import Layout from '../layouts/Layout';
function App() {
  console.clear();
  return (
    <>
      <ToastContainer />
      <Layout>
        <Header />
        <Main>
          <Router />
        </Main>
        <Footer />
      </Layout>
    </>
  );
}

export default App;
