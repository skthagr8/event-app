'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Modal, Button, Form } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const router = useRouter();
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null;

  useEffect(() => {
    if (user?.role !== 'renter') {
      toast.error('Access denied: only renters can view this page.');
      router.push('/listings');
      return;
    }
    fetchBookings();
  }, []);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.eventory-marketplace.store/api/';

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get(`${API_BASE}bookings/my-bookings/`);
      setBookings(res.data);
      toast.success('Bookings loaded');
    } catch {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (booking) => {
    setEditData({ ...booking });
    setShowModal(true);
  };

  const handleUpdate = async () => {
    try {
      await api.patch(`/bookings/${editData.id}/`, editData);
      toast.success('Booking updated');
      fetchBookings();
      setShowModal(false);
    } catch {
      toast.error('Failed to update booking');
    }
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  if (loading) return <p>Loading bookings...</p>;
  if (bookings.length === 0) return <p>No bookings found for user {user?.name || 'you'}.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">My Equipment Bookings</h1>
      <div className="grid gap-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="border rounded-lg p-4 bg-white shadow-md">
            <div className="mb-2">
              <Image src={booking.equipment.image_url} alt={booking.equipment.name} width={300} height={180} className="rounded" />
            </div>
            <p><strong>Equipment:</strong> {booking.equipment.name}</p>
            <p><strong>Quantity:</strong> {booking.quantity}</p>
            <p><strong>Status:</strong> {booking.status}</p>
            <p><strong>Total Price:</strong> Ksh {booking.total_price}</p>
            <p><strong>Start:</strong> {new Date(booking.start_date).toLocaleDateString()}</p>
            <p><strong>End:</strong> {new Date(booking.end_date).toLocaleDateString()}</p>
            <Button onClick={() => handleEditClick(booking)} className="mt-2" variant="dark">Edit</Button>
          </div>
        ))}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editData && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  name="quantity"
                  value={editData.quantity}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  name="start_date"
                  value={editData.start_date.split('T')[0]}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  name="end_date"
                  value={editData.end_date.split('T')[0]}
                  onChange={handleChange}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}