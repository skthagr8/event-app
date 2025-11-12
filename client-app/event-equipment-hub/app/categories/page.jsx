'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Container, Form, Button, Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';

export default function CategorySelectorPage() {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.eventory-marketplace.store/api/';

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('You must be logged in to view categories');
      setLoading(false);
      return;
    }

    axios.get(`${API_BASE}categories/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => setCategories(res.data))
      .catch(() => toast.error('Failed to fetch categories'))
      .finally(() => setLoading(false));
  }, [API_BASE]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selected) return toast.error('Please select a category');
    router.push(`/categories/${selected}`);
  };

  return (
    <Container className="mt-5">
      <h2>Select Equipment Category</h2>
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="categorySelect" className="mb-3">
            <Form.Label>Choose a category:</Form.Label>
            <Form.Select value={selected} onChange={(e) => setSelected(e.target.value)}>
              <option value="">-- Select Category --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Button type="submit" variant="primary">View Equipments</Button>
        </Form>
      )}
    </Container>
  );
}
