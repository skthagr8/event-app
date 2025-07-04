'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Poppins as popps } from 'next/font/google';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import Modal from 'react-modal';
import Image from 'next/image';

const poppins = popps({ subsets: ['latin'], weight: '400', style: 'normal' });

export default function MyListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [filters, setFilters] = useState({ keyword: '', sortBy: 'latest' });
  const router = useRouter();
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null;
  

  useEffect(() => {
    if (!user || user.role !== 'vendor') {
      toast.error('Access denied: Vendors only');
      router.push('/listings');
      return;
    }
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await api.get('http://localhost:8000/api/equipment/my-listings/');
      setListings(res.data);
      toast.success('Listings loaded');
    } catch (err) {
      toast.error('Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.delete(`/equipment/${id}/`);
      toast.success('Listing deleted');
      fetchListings();
    } catch {
      toast.error('Failed to delete listing');
    }
  };

  const handleEdit = (item) => setEditingItem(item);
  const closeModal = () => setEditingItem(null);

  const handleSave = async () => {
    try {
      await api.patch(`/equipment/${editingItem.id}/`, editingItem);
      toast.success('Listing updated');
      fetchListings();
      closeModal();
    } catch {
      toast.error('Update failed');
    }
  };

  const filteredListings = listings
    .filter((item) =>
      item.name.toLowerCase().includes(filters.keyword.toLowerCase())
    )
    .sort((a, b) => {
      if (filters.sortBy === 'price') return a.price_per_day - b.price_per_day;
      return new Date(b.created_at) - new Date(a.created_at);
    });

  if (loading) return <p className={`${poppins.className} pt-4`}>Loading your listings...</p>;

  return (
    <div className="p-6">
      <h1 className={`${poppins.className} text-2xl mb-4`}>My Uploaded Listings</h1>

      <div className="flex gap-4 mb-6">
        <input
          className="border p-2 rounded"
          placeholder="Search by name"
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
        />
        <select
          className="border p-2 rounded"
          value={filters.sortBy}
          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
        >
          <option value="latest">Sort by Latest</option>
          <option value="price">Sort by Price</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredListings.map((item) => (
          <div key={item.id} className="border rounded-lg shadow-md bg-white overflow-hidden">
            <div className="relative w-full h-52">
              <Image src={item.image_url || '/placeholder.jpg'} alt={item.name} fill className="object-cover" />
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-1">{item.name}</h2>
              <p className="text-sm text-gray-600">Category: {item.category}</p>
              <p className="text-sm text-gray-600">Condition: {item.condition}</p>
              <p className="text-sm">Price/Day: <strong>Ksh {item.price_per_day}</strong></p>
              <p className="text-sm">Quantity: {item.quantity}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleEdit(item)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >Edit</button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingItem && (
        <Modal
          isOpen={true}
          onRequestClose={closeModal}
          contentLabel="Edit Listing"
          className="bg-white p-6 rounded-lg max-w-lg mx-auto mt-20 border"
        >
          <h2 className="text-xl font-bold mb-4">Edit Listing</h2>
          <label className="block mb-2">Name</label>
          <input
            value={editingItem.name}
            onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
            className="border p-2 rounded w-full mb-3"
          />
          <label className="block mb-2">Price per Day</label>
          <input
            type="number"
            value={editingItem.price_per_day}
            onChange={(e) => setEditingItem({ ...editingItem, price_per_day: e.target.value })}
            className="border p-2 rounded w-full mb-3"
          />
          <label className="block mb-2">Quantity</label>
          <input
            type="number"
            value={editingItem.quantity}
            onChange={(e) => setEditingItem({ ...editingItem, quantity: e.target.value })}
            className="border p-2 rounded w-full mb-3"
          />
          <div className="flex gap-4 mt-4">
            <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
            <button onClick={closeModal} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
