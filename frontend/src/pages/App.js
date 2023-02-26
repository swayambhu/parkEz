import React from 'react';
import { Footer, Main } from '../components/Layout.styled';
import Header from '../Layouts/Header';
import Router from '../routes/Router';
function App() {
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
