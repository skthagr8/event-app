'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function PaymentStatusPage() {
  const [status, setStatus] = useState('pending');
  const router = useRouter();

  useEffect(() => {
    const trackingId = localStorage.getItem('tracking_id');
    if (!trackingId) {
      toast.error('Missing tracking ID');
      return;
    }
    console.log('Tracking ID:', trackingId);

    const checkStatus = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/payments/status/${trackingId}/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        const data = await res.json();
        setStatus(data.status);

        if (data.status === 'success') {
          toast.success('Payment successful!');
          localStorage.removeItem('tracking_id');
          setTimeout(() => {
            router.push('/success');
          }, 2000);
        }
      } catch (err) {
        console.error('Error checking status', err);
        toast.error('Could not check payment status.');
      }
    };

    const interval = setInterval(checkStatus, 3000); // poll every 3s
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
      <h2>Checking Payment Status...</h2>
      <p>Current Status: {status}</p>
    </div>
  );
}
