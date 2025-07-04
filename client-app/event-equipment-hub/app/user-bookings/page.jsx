'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Table, Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function UserBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user || user.role !== 'renter') {
      toast.error('Unauthorized. Only renters can view bookings.');
      router.push('/');
      return;
    }

    axios.get('http://localhost:8000/api/payments/user-bookings/', {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => setBookings(res.data))
    .catch(() => toast.error('Failed to load bookings'))
    .finally(() => setLoading(false));
  }, []);

  return (
    <Container className="mt-4">
      <h3>My Bookings</h3>
      {loading ? <Spinner animation="border" /> : (
        <Table striped bordered>
          <thead>
            <tr><th>Equipment</th><th>Quantity</th><th>Status</th><th>Start</th><th>End</th></tr>
          </thead>
          <tbody>
            {bookings.map((b, i) => (
              <tr key={i}>
                <td>{b.equipment?.name || 'Item'}</td>
                <td>{b.quantity}</td>
                <td>{b.status}</td>
                <td>{b.start_date}</td>
                <td>{b.end_date}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}
