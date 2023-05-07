import React, { useState } from 'react';
import {Main } from '../components/Layout.styled';
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import Router from '../routes/Router';
import MenuContext from '../MenuContext';

function App() {
  const [roleView, setRoleView] = useState('guest');

  console.clear();
  return (
    <MenuContext.Provider value={{ roleView, setRoleView }}> 
      <Header />
      <Main>
        <Router />
      </Main>
      <Footer />
    </MenuContext.Provider> 
  );
}

export default App;
