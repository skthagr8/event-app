'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Form, Button, Container, Spinner } from 'react-bootstrap';
import axios from 'axios';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function CheckoutPage() {
  const params = useParams();
  const equipmentId = params?.id;

  const [user, setUser] = useState(null);
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [option, setOption] = useState('hire');
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
  if (typeof window !== 'undefined') {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser?.id) {
          setUser(parsedUser);
          setEmail(parsedUser.email || ''); // Auto-fill email
          setFullName(parsedUser.name || ''); // Optional: Auto-fill name
        } else {
          toast.error('Invalid user session.');
        }
      } else {
        toast.error('User not logged in.');
      }
    } catch (err) {
      console.error('Failed to parse user:', err);
      toast.error('Error retrieving user session.');
    }
  }
}, []);


  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          toast.error('Missing access token.');
          return;
        }

        const res = await axios.get(`http://localhost:8000/api/equipment/${equipmentId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEquipment(res.data);
      } catch (err) {
        console.error('Error fetching equipment:', err);
        toast.error('Failed to load equipment details.');
      } finally {
        setLoading(false);
      }
    };

    if (equipmentId) fetchEquipment();
  }, [equipmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    if (!token) return toast.error('Missing access token.');
    if (!user || !user.id) return toast.error('User not loaded correctly.');

    const [firstName, ...rest] = fullName.trim().split(' ');
    const lastName = rest.join(' ') || 'Customer';

    let total_price = 0;
    if (option === 'hire') {
      if (!startDate || !endDate) return toast.error('Please select rental dates.');
      const days = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) + 1;
      const dailyRate = equipment?.price_per_day || 1000;
      total_price = days * dailyRate * quantity;
    } else {
      const unitPrice = equipment?.price || 1000;
      total_price = unitPrice * quantity;
    }

    const payload = {
      user_id: user.id,
      equipment_id: parseInt(equipmentId),
      phone,
      email,
      first_name: firstName,
      last_name: lastName,
      total_price,
      payment_type: option === 'hire' ? 'booking' : 'purchase',
      ...(option === 'hire' && {
        quantity,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      }),
    };

    try {
      const response = await axios.post(
        'http://localhost:8000/api/payments/daraja/',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { tracking_id } = response.data;
      localStorage.setItem('tracking_id', tracking_id);
      toast.success('Redirecting to payment...');
      setTimeout(() => window.location.href = '/payment-status', 2000);
    } catch (err) {
      console.error('Payment initiation failed:', err);
      toast.error(err?.response?.data?.error || 'Unable to process payment.');
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
        <p>Loading checkout details...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5" style={{ maxWidth: '600px' }}>
      <h2 className="mb-4">Checkout: {equipment?.name || 'Equipment'}</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Full Name</Form.Label>
          <Form.Control type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Choose Option</Form.Label>
          <Form.Select value={option} onChange={(e) => setOption(e.target.value)}>
            <option value="hire">Rent</option>
            <option value="buy">Buy</option>
          </Form.Select>
        </Form.Group>

        {option === 'hire' && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control type="number" min="1" max={equipment?.quantity || 10} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} selectsStart startDate={startDate} endDate={endDate} className="form-control" />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} selectsEnd startDate={startDate} endDate={endDate} minDate={startDate} className="form-control" />
            </Form.Group>
          </>
        )}

        <Button variant="success" type="submit">Confirm Order</Button>
      </Form>
    </Container>
  );
}
