import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import MenuContext from '../../../MenuContext';

const Navbar = () => {
  const { roleView, setRoleView } = useContext(MenuContext);

  return (
    <>
      <NavLink to={"/"} className={({isActive}) => isActive ? "active" : "" }>
        Home
      </NavLink>
      {roleView === 'guest' && (
        <>
          <NavLink to={"/browse-parking-lot"} className={({isActive}) => isActive ? "active" : "" }>
            Browse Lots
          </NavLink>
          <NavLink to={"/about"} className={({isActive}) => isActive ? "active" : "" }>
            About
          </NavLink>
          <NavLink to={"/contact"} className={({isActive}) => isActive ? "active" : "" }>
            Contact
          </NavLink>
          <NavLink to={"/faq"} className={({isActive}) => isActive ? "active" : "" }>
            FAQ
          </NavLink>
          <NavLink to={"/price"} className={({isActive}) => isActive ? "active" : "" }>
            Price
          </NavLink>
          <NavLink to={"/login"} className={({isActive}) => isActive ? "active" : "" }>
            Login
          </NavLink>
          <NavLink to={"/sign-up"} className={({isActive}) => isActive ? "active" : "" }>
            Sign Up
          </NavLink>
        </>
      )}
      {roleView === 'advertiser' && (
        <NavLink to={"/manage-ads"} className={({isActive}) => isActive ? "active" : "" }>
          Manage Ads
        </NavLink>
      )}
      {roleView === 'lotoperator' && (
        <NavLink to={"/manage-lots"} className={({isActive}) => isActive ? "active" : "" }>
          Manage Lots
        </NavLink>
      )}
      {roleView !== 'guest' && (
        <>
          <NavLink to={"/dashboard"} className={({isActive}) => isActive ? "active" : "" }>
            Dashboard
          </NavLink>
          <NavLink to={"/account"} className={({isActive}) => isActive ? "active" : "" }>
            Account
          </NavLink>
          <NavLink to={"/logout"} className={({isActive}) => isActive ? "active" : "" }>
            Logout
          </NavLink>
        </>
      )}

      <p>Role: {roleView}</p>
    </>
  );
};

export default Navbar;
