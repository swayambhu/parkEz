import {Routes, Route} from "react-router-dom";

// All Pages import
import { Pages } from "../index";

const Router = () => {
    const logins = ['employee', 'business', 'advertisers']
    return (
        <Routes>
            <Route path="/" element={<Pages.Home/>} />
            <Route path="/browse-parking-lot" element={<Pages.BrowseParkingLot />} />   
            <Route path="/about" element={<Pages.About/>} />
            <Route path="/contact" element={<Pages.Contact/>} />
            <Route path="/faq" element={<Pages.FAQ/>} />
            <Route path="/login">
                {logins.map((login, idx) => (
                    <Route path={login} key={`login-${idx}`} element={<Pages.Login/>} />
                ))}
            </Route>
            <Route path="/pricing" element={<Pages.Pricing/>} />
            <Route path="/summarize-account" element={<Pages.SummarizeAccount/>} />
            
            <Route path="/sign-up">  
                {logins.map((login, idx) => (
                    <Route path={login} key={`sign-up-${idx}`} element={<Pages.SignUp/>} />
                ))}
            </Route>  
        </Routes>
    )
}
export default Router