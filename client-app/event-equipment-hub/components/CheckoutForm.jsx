import axios from 'axios';
import { useState } from 'react'; 
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';
import withAuth from '@/utils/withauth';

function CheckoutForm({ isOpen, onClose, onSubmit, equipment }) {
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.eventory-marketplace.store/api/';

    const accessToken = localStorage.getItem('accessToken');

    try {
      const response = await axios.post(
        `${API_BASE}bookings/`,
        {
          equipment: equipment.id,
          quantity,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

     if (response.status === 201 || response.status === 200)
     {toast.success('🎉 Booking successful!');
    setSuccessMessage('Booking confirmed! You will receive further details via email.');}
    
      // Optional: you can pass data back to parent
      if (onSubmit) onSubmit(response.data);

      // Close the modal
      onClose();
    } catch (err) {
      console.error('Booking failed:', err);
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Booking failed. Please try again.';
      setError(msg);
    }
  };

  if (!isOpen) return null;

  

  return (
    <div className="fixed inset-0 backdrop-blur-lg bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg relative shadow-xl">
        <button
          className="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4">Rent {equipment.name}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Quantity</label>
            <input
              type="number"
              min="1"
              max={equipment.quantity}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {error && <p className="text-red-500">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Confirm Booking
          </button>
        </form>
      </div>
    </div>
  );
}
export default withAuth(CheckoutForm);