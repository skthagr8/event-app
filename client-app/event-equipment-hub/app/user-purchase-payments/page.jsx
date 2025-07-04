'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Table, Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function UserPurchasePayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user || user.role !== 'renter') {
      toast.error('Unauthorized. Only renters can view purchase payments.');
      router.push('/');
      return;
    }

    axios.get('http://localhost:8000/api/payments/user-purchase-payments/', {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => setPayments(res.data))
    .catch(() => toast.error('Failed to load purchase payments'))
    .finally(() => setLoading(false));
  }, []);

  return (
    <Container className="mt-4">
      <h3>My Purchase Payments</h3>
      {loading ? <Spinner animation="border" /> : (
        <Table striped bordered>
          <thead>
            <tr><th>Amount</th><th>Status</th><th>Paid At</th></tr>
          </thead>
          <tbody>
            {payments.map((p, i) => (
              <tr key={i}>
                <td>{p.amount}</td>
                <td>{p.status}</td>
                <td>{p.paid_at}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}
