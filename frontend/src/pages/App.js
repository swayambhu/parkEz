import React from 'react';
import {Main } from '../components/Layout.styled';
import Header from "../layouts/Header"
import Footer from "../layouts/Footer"
import Router from '../routes/Router';
function App() {
  console.clear();
  return (
    <>
      <Header />
      <Main>
        <Router />
      </Main>
      <Footer />
    </>
  );
}

export default App;
