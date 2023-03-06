import {Routes, Route} from "react-router-dom";

// All Pages import
import { Pages } from "../index";

const Router = () => {

    return (
        <Routes>
            <Route path="/" element={<Pages.Home/>} />
            <Route path="/about" element={<Pages.About/>} />
            <Route path="/contact" element={<Pages.Contact/>} />
            <Route path="/faq" element={<Pages.FAQ/>} />
            <Route path="/login" element={<Pages.Login/>} />
            <Route path="/pricing" element={<Pages.Pricing/>} />
            <Route path="/sign-up" element={<Pages.SignUp />} />    
        </Routes>
    )
}
export default Router