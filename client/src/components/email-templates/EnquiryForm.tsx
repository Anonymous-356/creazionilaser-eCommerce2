// components/email-templates/EnquiryForm.jsx
import React from "react";
import { Html, Head, Body, Container, Section, Text, Button } from '@react-email/components';

export function EnquiryForm() {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f6f6f6' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '20px' }}>
          <Section>
            <Text>Dear Hassan Aqiq,</Text>
            <Text>Thank you for your order! Your order #1245 has been confirmed.</Text>
            {/* Render order items dynamically */}
            {/* {orderDetails.items.map((item) => (
              <Text key={item.id}>{item.name} - Quantity: {item.quantity}</Text>
            ))} */}
            <Button href="#" style={{ backgroundColor: '#007bff', color: '#ffffff', padding: '10px 20px', borderRadius: '5px' }}>
              Track Your Order
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}