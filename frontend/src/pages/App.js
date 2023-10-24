import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import React from 'react';
import {Main } from '../components/Layout.styled';
import Header from "../layouts/Header"
import Router from '../routes/Router';
import { ToastContainer } from 'react-toastify';
const stripePromise = loadStripe('pk_test_51NwvsaDI89byjwRRr5t32OfvNlKh8ywXfqOYp4e6ofb52Xhjuft9jKRLWobLhGowrieHLHU5C9fL13Tq2KzW3yxa00ePSFj4RB');

function App() {
  console.clear();
  return (
    <>
    <Elements stripe={stripePromise}>
      <ToastContainer />
      <Header />
      <Main>
        <Router />
      </Main>
    </Elements>
    </>
  );
}

export default App;
