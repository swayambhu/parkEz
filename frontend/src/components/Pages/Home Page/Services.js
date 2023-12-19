import styled from "styled-components";
import { Link } from "react-router-dom";
import { CommonSection, Card } from "../../Global.styled";
import VideoPlayer from '../../../pages/VideoPlayer'; 

const Services = () => {
    const services = [
        {
            icon: "bi bi-camera-video-fill",
            text: "Automated Parking Lot Management"
        },
        {
            icon: "bi bi-car-front-fill",
            text: "Customer Parking Assistance"
        },
        {
            icon: "bi bi-shop-window",
            text: "Local Advertising Opportunities"
        },
    ]
    return(
        <CommonSection>
            <h2>About The ParkEz Project</h2>
            <div>
            <p style={{margin:'5px', padding:'5px'}}>
                This is an interactive archive of a 2023 Pace University team capstone project for CS691 and CS692. 
                Since class focused on Software Engineering and documentation, be sure to check out the Documentation folders  
                on <a href="https://github.com/swayambhu/parkEz/" target='_blank'>the project's GitHub</a>. 
            </p>
            <p style={{margin:'5px',padding:'5px'}}>To learn about the project's core parking lot monitoring features watch the final demo, 
            originally presented on 12/15/2023:</p>
            </div>

            <p style={{ display: "block", marginTop:'0px', marginBottom:'0px', marginLeft: "auto", marginRight: "auto" }} >
            <VideoPlayer src='/videos/demo1.mp4' />
            </p>
            <p style={{margin:'5px',padding:'5px'}}>To learn about the project's advertising and payment features watch this demo:</p>
            <p style={{ display: "block", marginTop:'0px', marginBottom:'0px', marginLeft: "auto", marginRight: "auto" }}  >
            <VideoPlayer src='/videos/demo2.mp4' />
            </p>
            <div>
            <p style={{margin:'5px',padding:'5px'}}>Several features you'll see in the demos have been removed to make archiving the project
            sustainable, as it was completed in December 2023. New images from&nbsp;  
            <a href="https://www.youtube.com/watch?v=EPKWu223XEg" target="_blank">Collingwood Town's YouTube webcam</a> &nbsp;are 
            no longer being processed, although AI labeled images from 11/8/2023 to 12/18/2023 are still available to review. 
            Existing ads are visible and count clicks and impressions are recorded, but ads can no longer be added or edited. 
            All payment features, which depended on Stripe's API, have been removed. 
            All account types can still be logged in to, but new accounts can no longer be created.</p>
            </div>
            <h2>Services</h2>
            <CardWrapper className="flex-center">
                {services.map(({icon, text}, idx) => (
                    <ServicesCard key={idx} className="flex-center">
                        <div className="left-side">
                            <p>
                            <i className={icon}></i>
                            </p>
                        </div>
                        <div className="right-side">
                            <p>
                                {text}
                            </p>
                        </div>
                    </ServicesCard>
                ))}
        
            </CardWrapper>
        </CommonSection>
    )
}


const CardWrapper = styled.div`
    gap: 30px;
    width: 100%;
    max-width: 1000px;
    align-items: stretch;
    margin: 0px auto;
    flex-wrap: wrap;
`


const ServicesCard = styled(Card)`
    gap: 20px;
    width: calc(100% / 3 - 20px);
    max-width: 600px;
    margin: 0px auto;

    .left-side p i{
        font-size: 4rem;
    }

    .right-side p{
        font-size: 1.3rem;
        text-align: center;
        font-weight: 500;
    }

`

export default Services