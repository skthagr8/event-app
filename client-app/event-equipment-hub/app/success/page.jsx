'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Card, Button } from 'react-bootstrap';
import { FaCheckCircle } from 'react-icons/fa';

export default function PaymentSuccessPage() {
  const router = useRouter();

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card className="text-center p-5 shadow" style={{ maxWidth: '500px' }}>
        <FaCheckCircle size={80} color="green" className="mb-3" />
        <h2 className="mb-3">Payment Successful!</h2>
        <p className="mb-4">Your transaction was completed successfully. Thank you for your payment.</p>
        <Button variant="success" onClick={() => router.push('/listings')}>
          Go to Homepage
        </Button>
      </Card>
    </Container>
  );
}
