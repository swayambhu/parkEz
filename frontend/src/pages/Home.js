import Brands from "../components/Pages/Home Page/OurPartners"
import HeroSection from "../components/Pages/Home Page/HeroSection"
import KeyProperties from "../components/Pages/Home Page/KeyProperties"
import Services from "../components/Pages/Home Page/Services"
import Reviews from "../components/Pages/Home Page/Reviews"
import Footer from "../layouts/Footer"


const Home = () => {
    return(
        <>
            <HeroSection/>
            <Services/>
            <KeyProperties />
            <Brands/>
            <Reviews />
            <Footer />
        </>
    )
}

export default Home