'use client';

import { useState, useEffect } from 'react';
import  withAuth from '@/utils/withauth';
import EquipmentCard from '@/components/EquipmentCard';
import FilterSidebar from '@/components/FilterSidebar';
import { Poppins as popps} from 'next/font/google'

const poppins = popps({
  subsets: ['latin'],
  weight: '400',
  style: 'normal',
})

function ListingsPage() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);

  

  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    maxPrice: 10000,
    condition: { New: false, Used: false },
    rentable: false,
    recent: false,
    budget: false,
  });

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.eventory-marketplace.store/api/';


  useEffect(() => {
  async function fetchFilteredEquipment() {
    const token = localStorage.getItem('accessToken');
    let url = `${API_BASE}equipment/`;

    const query = [];
    if (filters.category) query.push(`category=${filters.category}`);
    if (filters.maxPrice) query.push(`max_price=${filters.maxPrice}`);
    // You could also send condition filter in the future
    if (query.length) url += `?${query.join('&')}`;

    try {
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error('Unauthorized or failed to fetch');
      const data = await res.json();

      const equipment = data.map((item) => ({
        id: item.id,
        title: item.name,
        price: Number(item.buying_price),
        rent_per_day: Number(item.price_per_day),
        condition: item.condition,
        is_premium: item.is_premium,
        quantity: Number(item.quantity),
        is_available: item.is_available,
        image_url: item.image.startsWith('http')
      ? item.image
      : `https://api.eventory-marketplace.store/${item.image.replace('\\','/')}`,
        category: item.category,
        updated_at: item.updated_at,
      }));

      setEquipmentList(equipment);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch filtered equipment:', error);
    }
  }

  fetchFilteredEquipment();
}, [filters]); // ← filters triggers new fetch

  const filteredList = equipmentList.filter((e) => {
    const { keyword, category, maxPrice, condition} = filters;

    if (keyword && !e.title.toLowerCase().includes(keyword.toLowerCase())) return false;
    if (category && e.category !== category) return false;
    if (e.price > maxPrice) return false;

    if (condition.New !== condition.Used) {
      if (condition.New && e.condition !== 'Brand New') return false;
      if (condition.Used && e.condition !== 'Used') return false;
    }

    return true;
  });

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className={`${poppins.className} container-fluid px-0 mt-4 pl-0 pt-6`}>
      <div className="d-flex flex-column flex-lg-row gap-4 ml-0">
        {/* Sidebar */}
        <div style={{ flex: '0 0 280px' }} className='mr-1 ml--1' >
          <div className="border p-3 rounded shadow-sm bg-white"
          style={{position: 'sticky',top: '1rem', zIndex: 100, }}>
            <div className="mb-3">
              <input
                type="text"
                placeholder="Search by keyword..."
                value={filters.keyword}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, keyword: e.target.value }))
                }
                className="form-control"
              />
            </div>

            <FilterSidebar filters={filters} setFilters={setFilters} />

            <div className="mt-3">
              <button
                className="btn w-100 text-white"
                style={{ backgroundColor: '#4D392D' }}
              >
                Search
              </button>
            </div>

            <div className="mt-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <button
                  onClick={() =>
                    setFilters({
                      keyword: '',
                      category: '',
                      maxPrice: 30000,
                      condition: { New: false, Used: false }
                    })
                  }
                  className="btn btn-sm btn-link p-0 text-secondary"
                >
                  
                </button>
              </div>
              {[
              ].map(({ id, label, field }) => (
                <div className="form-check" key={id}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={id}
                    checked={filters[field]}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, [field]: e.target.checked }))
                    }
                  />
                  <label className="form-check-label" htmlFor={id}>
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Equipment Cards */}
        <div className="flex-grow-1">
          <h3 className="mb-3 fw-semibold">Search Results</h3>
          <div className="d-flex flex-wrap gap-3">
            {filteredList.map((equipment) => (
              <div key={equipment.id} style={{ flex: '1 1 300px', maxWidth: 'calc(33.333% - 1rem)' }}>
                <EquipmentCard {...equipment} />
              </div>
            ))}
          </div>
          {filteredList.length === 0 && (
            <p className="text-muted mt-3">No equipment matched your filters.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuth(ListingsPage);
