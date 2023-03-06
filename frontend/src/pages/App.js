import React from 'react';
import {Main } from '../components/Layout.styled';
import Footer from '../Layouts/Footer';
import Header from '../Layouts/Header';
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
