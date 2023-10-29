import {Routes, Route} from "react-router-dom";

// All Pages import
import { Pages } from "../index";

const Router = () => {
    const logins = ['employee', 'business', 'advertisers']
    return (
        <Routes>
            <Route path="/" element={<Pages.Home/>} />
            <Route path="/dashboard" element={<Pages.Dashboard />} />
            <Route path="/browse-parking-lot" element={<Pages.BrowseParkingLot />} />   
            <Route path="/about" element={<Pages.About/>} />
            <Route path="/contact" element={<Pages.Contact/>} />
            <Route path="/faq" element={<Pages.FAQ/>} />
            <Route path="/billing" element={<Pages.Billing/>} />
            <Route path="/success" element={<Pages.Success/>} />
            <Route path="/manage-payments" element={<Pages.ManagePayments/>} />
            <Route path="/login">
                {logins.map((login, idx) => (
                    <Route path={login} key={`login-${idx}`} element={<Pages.Login/>} />
                ))}
            </Route>
            <Route path="/create-ad" element={<Pages.CreateAd />} />
            <Route path="/edit-ad/:id" element={<Pages.EditAd />} />
            <Route path="/lot/:lot" element={<Pages.LotLatest />} />
            <Route path="/pricing" element={<Pages.Pricing />} />     
            <Route path="/sign-up">  
                {logins.map((login, idx) => (
                    <Route path={login} key={`sign-up-${idx}`} element={<Pages.SignUp/>} />
                ))}
            </Route>
            <Route path="/ad-admin" element={<Pages.AdAdmin />} />
            <Route path="/admin-create-ad" element={<Pages.AdminCreateAd />} />
            <Route path="/image/:lot/:imageName" element={<Pages.SpecificImage />} />
            <Route path="/fakelot/:lot" element={<Pages.FakeLot />} />

        </Routes>
    )
}
export default Router