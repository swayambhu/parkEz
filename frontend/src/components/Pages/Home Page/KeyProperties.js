import { Card, CommonSection } from "../../Global.styled";
import styled from "styled-components"
import ImageBlock from "../../Reusable components/ImageBlock";

const KeyProperties = () => {

    const properties_1 = [
        {
            icon: "",
            text: "Accuracy",
        },
        {
            icon:"",
            text: "Reliability",
        },
        {
            icon:"",
            text: "Speed",
        },
        {
            icon:"",
            text: "Compatibility",
        },
    ]

    const properties_2 = [
        {
            icon: "",
            text: "Easy installation",
        },
        {
            icon:"",
            text: "Low Maintenance",
        },
        {
            icon:"",
            text: "Energy efficiency",
        },
        {
            icon:"",
            text: "Integration",
        },
    ]
    return(
        <Section>
            <h2>Key Properties</h2>
            <PropertiesMainWrapper className="flex-center">
                <PropertiesWrapper>
                    <PropertiesCard className="flex-center">
                        <i className="bi bi-bullseye"></i>
                        <p>
                            Property 1
                        </p>
                    </PropertiesCard>

                    <PropertiesCard className="flex-center">
                        <i className="bi bi-ui-checks-grid"></i>
                        <p>
                            Property 1
                        </p>
                    </PropertiesCard>

                    <PropertiesCard className="flex-center">
                        <i className="bi bi-ui-checks-grid"></i>
                        <p>
                            Property 1
                        </p>
                    </PropertiesCard>

                    <PropertiesCard className="flex-center">
                        <i className="bi bi-ui-checks-grid"></i>
                        <p>
                            Property 1
                        </p>
                    </PropertiesCard>
                </PropertiesWrapper>

                
                <CarTextImageWrapper className="flex-center">
                    <ImageBlock src={require("../../../assets/images/logo.png")} alt="car-navigation" w={"220px"} h={"220px"}/>
                    <h3>ParkEz</h3>
                </CarTextImageWrapper>

                <PropertiesWrapper>
                    <PropertiesCard className="flex-center">
                        <i className="bi bi-ui-checks-grid"></i>
                        <p>
                            Property 1
                        </p>
                    </PropertiesCard>

                    <PropertiesCard className="flex-center">
                        <i className="bi bi-ui-checks-grid"></i>
                        <p>
                            Property 1
                        </p>
                    </PropertiesCard>

                    <PropertiesCard className="flex-center">
                        <i className="bi bi-ui-checks-grid"></i>
                        <p>
                            Property 1
                        </p>
                    </PropertiesCard>

                    <PropertiesCard className="flex-center">
                        <i className="bi bi-ui-checks-grid"></i>
                        <p>
                            Property 1
                        </p>
                    </PropertiesCard>
                </PropertiesWrapper>
            </PropertiesMainWrapper>
        </Section>
    )
}

const Section = styled(CommonSection)`
    background: linear-gradient(90deg, rgba(25,5,230,1) 0%, rgba(9,9,121,1) 50%, rgba(0,110,255,1) 100%);

    h2{
        color: #ffffff;
    }
`

const PropertiesMainWrapper = styled.div`
    gap: 40px;
`

const PropertiesWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 30px;
`

const PropertiesCard = styled(Card)`
    gap: 10px;
    i{
        font-size: 3rem;
    }

    p{
        font-size: 1.5rem;
    }
`

const CarTextImageWrapper = styled(Card)`
    flex-direction: column;
    gap: 40px;
    h3{
        font-size: 1.6rem;
        text-align: center;
    }
`
export default KeyProperties;