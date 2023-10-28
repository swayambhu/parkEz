import React from 'react';
import { createRoot } from 'react-dom/client';

// React Router DOM Imports
import {BrowserRouter} from 'react-router-dom';


// User Imports
import "./assets/css/index.css"
import 'bootstrap/dist/css/bootstrap.min.css';

// PAGES
import About from "./pages/About";
import App from "./pages/App";
import Contact from "./pages/Contact";
import FAQ from "./pages/Faq";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Pricing from "./pages/Pricing";
import SignUp from "./pages/SignUp";
import BrowseParkingLot from './pages/BrowseParkingLots';
import Dashboard from './pages/TempDashboard';
import Billing from './pages/Billing';
import Success from './pages/Success';
import CreateAd from './pages/CreateAd';
import ManagePayments from './pages/ManagePayments';
import EditAd from './pages/EditAd';
import AdAdmin from './pages/AdAdmin';
import AdminCreateAd from './pages/AdminCreateAd';
import LotLatest from './pages/LotLatest';
import SpecificImage from './pages/SpecificImage';
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);


export const Pages = {
  About,
  Contact,
  FAQ,
  Home,
  Login,
  Pricing,
  SignUp,
  BrowseParkingLot,
  Dashboard,
  Billing,
  Success,
  ManagePayments,
  CreateAd,
  EditAd,
  AdAdmin,
  AdminCreateAd,
  LotLatest,
  SpecificImage
}
