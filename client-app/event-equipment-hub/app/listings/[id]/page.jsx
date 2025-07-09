'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Poppins as popps } from 'next/font/google';
import  withAuth from '@/utils/withauth';
import CheckoutForm from '@/components/CheckoutForm';
import Link from 'next/link';


const poppins = popps({
  subsets: ['latin'],
  weight: '400',
  style: 'normal',
});

function EquipmentDetailsPage() {
  const { id } = useParams();
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null;

  useEffect(() => {
    if (!id) return;

    async function fetchEquipment() {
      const token = localStorage.getItem('accessToken');
      try {
        const res = await fetch(`http://localhost:8000/api/equipment/${id}/`, 
        {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        });

        if (!res.ok) throw new Error('Equipment not found');
        const data = await res.json();

        const item = {
          id: data.id,
          title: data.name,
          price: Number(data.buying_price),
          rent_per_day: Number(data.price_per_day),
          condition: data.condition,
          is_premium: data.is_premium,
          quantity: Number(data.quantity),
          is_available: data.is_available,
          image_url: data.image,
          category: data.category,
          updated_at: new Date(data.updated_at).toLocaleDateString(),
        };

        setEquipment(item);
      } catch (error) {
        console.error('Error fetching equipment:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEquipment();
  }, [id]);

  if (loading) return <p className="text-center mt-5">Loading...</p>;
  if (!equipment) return <p className="text-center mt-5">Equipment not found.</p>;

  return (
    <div className={`${poppins.className} container py-5`}>
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="card shadow-sm border-0 p-4">
            <div className="row g-4 align-items-center">
              {/* Image */}
              <div className="col-md-5">
                <img
                  src={equipment.image_url}
                  alt={equipment.title}
                  className="img-fluid rounded"
                  style={{ objectFit: 'cover', maxHeight: '400px', width: '100%' }}
                />
              </div>

              {/* Details */}
              <div className="col-md-7">
                <h2 className="fw-bold mb-3">{equipment.title}</h2>
                <p className="text-muted mb-2"><strong>Category:</strong> {equipment.category}</p>
                <p className="text-muted mb-2"><strong>Condition:</strong> {equipment.condition}</p>
                <p className="text-muted mb-2"><strong>Last Updated:</strong> {equipment.updated_at}</p>
                <p className="text-muted mb-2"><strong>Availability:</strong> {equipment.is_available ? 'Available' : 'Out of Stock'}</p>


                <hr className="my-3" />

                <div className="mb-2">
                  <h4 className="text-success fw-bold">
                    KES {equipment.price.toLocaleString()} <small className="text-muted fs-6">(Buy)</small>
                  </h4>
                </div>

                {equipment.rent_per_day > 0 && (
                  <div className="mb-2">
                    <h5 className="text-primary">
                      KES {equipment.rent_per_day.toLocaleString()} <small className="text-muted fs-6">/ day (Rent)</small>
                    </h5>
                  </div>
                )}

                {equipment.is_premium && (
                  <span className="badge bg-warning text-dark mt-3">Premium Listing</span>
                )}

                {user?.role !== 'vendor' && (
  <div className="mt-4">
    <Link href={`/checkout/${id}`} passHref>
      <button className="btn btn-dark me-2">Buy Now</button>
    </Link>
    {equipment.rent_per_day > 0 && (
      <Link href={`/checkout/${id}`} passHref>
        <button className="btn btn-outline-primary">Rent Now</button>
      </Link>
    )}
  </div>
)}

              </div>
            </div>
            <CheckoutForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        equipment={equipment}
      />
          </div>
        </div>
      </div>  
    </div>
  );
}

export default withAuth(EquipmentDetailsPage);