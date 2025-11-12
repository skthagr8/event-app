'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Poppins as popps } from 'next/font/google';

const poppins = popps({ subsets: ['latin'], weight: '400', style: 'normal' });

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.eventory-marketplace.store/api/';

export default function EquipmentPostPage() {
  const [form, setForm] = useState({
    name: '',
    vendor: null,
    category: '',
    description: '',
    buying_price: '',
    price_per_day: '',
    quantity: 1,
    condition: 'Brand New',
    is_premium: false,
    for_sale: false,
    image: null,
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null;

  useEffect(() => {
    if (!user || user.role !== 'vendor') {
      toast.error('Access denied. Only vendors can post equipment.');
      router.push('/listings');
      return;
    }

    // Set current vendor
    setForm(prev => ({ ...prev, vendor: user.id }));

    // Fetch categories
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get(`${API_BASE}categories/`);
      setCategories(res.data);
    } catch (err) {
      toast.error('Failed to load categories');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
    } else if (type === 'file') {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
    if (value !== null) {
    if (key === 'is_premium' || key === 'for_sale') {
      formData.append(key, value ? 'True' : 'False');  // send as string
    } else {
      formData.append(key, value);
    }
  }
});

    try {
      await api.post('http://localhost:8000/api/equipment/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Equipment posted successfully');
      router.push('/my-listings');
    } catch (err) {
      toast.error('Failed to post equipment');
      console.error("Error posting equipment:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className={`${poppins.className} text-2xl mb-4 font-semibold`}>
        Post New Equipment
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border p-2 rounded"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        {/* Category Dropdown */}
        <select
          name="category"
          className="w-full border p-2 rounded"
          value={form.category}
          onChange={handleChange}
          required
        >
          <option value="">Select a Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <textarea
          className="w-full border p-2 rounded"
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />

        <input
          className="w-full border p-2 rounded"
          name="buying_price"
          type="number"
          placeholder="Buying Price"
          value={form.buying_price}
          onChange={handleChange}
          required
        />
        <input
          className="w-full border p-2 rounded"
          name="price_per_day"
          type="number"
          placeholder="Price per Day"
          value={form.price_per_day}
          onChange={handleChange}
          required
        />
        <input
          className="w-full border p-2 rounded"
          name="quantity"
          type="number"
          placeholder="Quantity"
          value={form.quantity}
          onChange={handleChange}
          required
        />

        <select
          name="condition"
          className="w-full border p-2 rounded"
          value={form.condition}
          onChange={handleChange}
        >
          <option value="Brand New">Brand New</option>
          <option value="Used">Used</option>
        </select>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_premium"
              checked={form.is_premium}
              onChange={handleChange}
            />
            Premium
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="for_sale"
              checked={form.for_sale}
              onChange={handleChange}
            />
            For Sale
          </label>
        </div>

        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          className="w-full"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-[#4a372a] text-white px-4 py-2 rounded hover:bg-[#3a2b1f]"
        >
          {loading ? 'Posting...' : 'Post Equipment'}
        </button>
      </form>
    </div>
  );
}
