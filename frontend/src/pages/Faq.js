import React from 'react';
import styled from 'styled-components';

const FAQ = () => {
    return (
      <>
        <AboutWrapper>
          <SectionHeader>Frequently Asked Questions</SectionHeader>
          {faq.map(({ title, paragraph, items }, idx) => (
            <React.Fragment key={idx}>
              <SectionHeader>{title}</SectionHeader>
              <RoundedRectangle>
                <Paragraph>
                  {paragraph}
                  {items && (
                    <ul>
                      {items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                </Paragraph>
              </RoundedRectangle>
            </React.Fragment>
          ))}
        </AboutWrapper>
      </>
    );
  };
  

const faq = [
  {
    title: "What is ParkEZ?",
    paragraph:
      "ParkEZ is an innovative parking monitoring solution provider that offers a seamless parking experience for businesses, property owners, and customers. We provide an efficient platform for monitoring parking spaces, maximizing revenue, and offering local businesses advertising opportunities to reach potential customers.",
  },
  {
    title: "How does ParkEZ work?",
    paragraph:
      "For businesses and property owners, ParkEZ uses AI and machine learning to monitor and analyse parking spaces, helping to identify illegal parking and ensure that spaces are utilized by patrons. Customers can use our website to check real-time parking availability at their favorite establishments using ParkEz.",
  },
  {
    title: "What are the benefits of using ParkEZ for my business or property?",
    paragraph: "",
    items: [
      "Efficient parking management and monitoring",
      "Maximization of revenue from parking spaces",
      "Minimization of crime and illegal parking",
      "Innovative advertising opportunities for local businesses",
      "Enhanced customer experience with real-time parking availability",
    ],
  },
  {
    title: "How much does it cost to use ParkEZ?",
    paragraph:
      "For businesses and property owners, ParkEZ operates on a monthly subscription basis. The exact cost depends on the size and specific needs of your property. For customers, our website is free to use. For advertising rates, please contact our advertising management group.",
  },
  {
    title: "How do I report a problem or request support?",
    paragraph:
      "If you encounter any issues or require assistance, you can reach our customer support team through the website, or by email. Our dedicated team is available to address your concerns and provide timely resolutions.",
  },
  {
    title: "How can I advertise my business on ParkEz?",
    paragraph:
      "To advertise your business on ParkEZ, please contact our customer support team. They will guide you through the process of selecting ad placements, creating and uploading your advertisements, and monitoring their performance.",
  },
];

const Paragraph = styled.p`
  font-size: 1.2rem;
  line-height: 1.5;
  color: #333;
  text-align: justify;

  & > ul {
    font-size: 1.2rem;
    width: 600px;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 10px;
  }
`;



const RoundedRectangle = styled.div`
  background-color: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 700px;
  margin-bottom: 1px;
`;

const SectionHeader = styled.h2`
  font-size: 1.3rem;
  font-weight: 600;
  width:600px;
  text-transform: uppercase;
  color: rgb(10, 12, 138);
  text-align: center;
`;


const AboutWrapper = styled.div`
  padding: 50px 20px;
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-items: center;
  background-color: #EEEEEE;
`;

export default FAQ;
