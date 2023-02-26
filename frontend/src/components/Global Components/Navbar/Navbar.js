import urls from "../../../utils/urls";
import NavItem from "./NavItem";

const Navbar = () => {
    return (
        <>
            <ul className="flex-right">
                {urls.map(({path, text}, idx) => (
                    <NavItem path={path} text={text} key={`${idx}`} />
                ))}
            </ul>
        </>
    )
}

export default Navbar