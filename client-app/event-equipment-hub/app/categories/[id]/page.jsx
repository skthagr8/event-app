'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { Spinner, Row, Col, Container } from 'react-bootstrap';
import toast from 'react-hot-toast';
import EquipmentCard from '@/components/EquipmentCard';
import { Poppins as popps} from 'next/font/google'

const poppins = popps({
  subsets: ['latin'],
  weight: '400',
  style: 'normal',
})


export default function CategoryEquipments() {
  const params = useParams();
  const categoryId = params?.id;

  const [equipments, setEquipments] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!categoryId) {
      toast.error('No category ID found in URL');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [equipRes, catRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/equipment/?category=${categoryId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
          axios.get(`http://localhost:8000/api/categories/${categoryId}/`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
        ]);

        setEquipments(equipRes.data);
        setCategoryName(catRes.data.name);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load equipment or category');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId]);

  return (
    <Container className={`${poppins.className} mt-5 gap-2 container-fluid px-0  pl-0 pt-6`} >
      <h2>Equipments in "{categoryName}" Category</h2>

      {loading ? (
        <Spinner animation="border" />
      ) : equipments.length === 0 ? (
        <p>No equipment available in this category.</p>
      ) : (
        <Row>
          {equipments.map((e) => (
            <Col key={e.id} md={4} className="mb-4">
              <EquipmentCard
                id={e.id}
                title={e.name}
                price={e.buying_price}
                rent_per_day={e.price_per_day}
                condition={e.condition}
                is_premium={e.is_premium}
                quantity={e.quantity}
                image_url={e.image_url}
              />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
