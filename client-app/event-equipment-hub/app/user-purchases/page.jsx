'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Table, Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function UserPurchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.eventory-marketplace.store/api/';


  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user || user.role !== 'renter') {
      toast.error('Unauthorized. Only renters can view purchases.');
      router.push('/');
      return;
    }

    axios.get(`${API_BASE}payments/user-purchases/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => setPurchases(res.data))
    .catch(() => toast.error('Failed to load purchases'))
    .finally(() => setLoading(false));
  }, []);

  return (
    <Container className="mt-4">
      <h3>My Purchases</h3>
      {loading ? <Spinner animation="border" /> : (
        <Table striped bordered>
          <thead>
            <tr><th>Equipment</th><th>Price</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>
            {purchases.map((p, i) => (
              <tr key={i}>
                <td>{p.equipment?.name || 'Item'}</td>
                <td>{p.total_price}</td>
                <td>{p.status}</td>
                <td>{p.created_at}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}
