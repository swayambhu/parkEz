import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";

// User Imports
import "./assets/css/index.css";

// PAGES
import About from "./pages/About";
import App from "./pages/App";
import Contact from "./pages/Contact";
import FAQ from "./pages/Faq";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Pricing from "./pages/Pricing";
import SignUp from "./pages/SignUp";
import BrowseParkingLot from "./pages/BrowseParkingLots";
import AuthRecords from "./pages/AuthRecords";
import Dashboard from "./pages/Dashboard";
import Logout from "./pages/Logout";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
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
  AuthRecords,
  Dashboard,
  Logout,
};
