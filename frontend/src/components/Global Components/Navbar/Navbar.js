import { NavLink } from "react-router-dom";
import urls from "../../../utils/urls";
import NavItem from "./NavItem";
import Dropdown from 'react-bootstrap/Dropdown';

const Navbar = () => {
    return (
        <>
            <ul className="flex-right">
                {urls.map(({path, text}, idx) => (
                    <NavItem path={path} text={text} key={`${idx}`} />
                ))}
                <li>
                <Dropdown>
                    <Dropdown.Toggle variant="primary" id="dropdown-basic">
                        Login
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.Item>
                            <NavLink to="/login/employee" className={({isActive}) => isActive ? "active" : "" }>
                                Employee
                            </NavLink>
                        </Dropdown.Item>

                        <Dropdown.Item>
                            <NavLink to="/login/advertisers" className={({isActive}) => isActive ? "active" : "" }>
                                Advertiser
                            </NavLink>
                        </Dropdown.Item>

                        <Dropdown.Item>
                            <NavLink to="/login/business" className={({isActive}) => isActive ? "active" : "" }>
                                Business
                            </NavLink>
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>     
                </li>
            </ul>
        </>
    )
}

export default Navbar