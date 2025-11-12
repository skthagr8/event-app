'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Poppins as popps} from 'next/font/google'


const poppins = popps({
  subsets: ['latin'],
  weight: '400',
  style: 'normal',
});

function LoginForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.eventory-marketplace.store/api/';


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}login/`, formData, {
        headers: {
        'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
       const { access, refresh, user } = response.data;
        
        // ✅ Save tokens and user info to localStorage
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        localStorage.setItem('user', JSON.stringify(user));
        router.push('/listings'); // redirect to home or dashboard
      }
    } catch (err) {
      console.error('Login error:', err.response || err);
      setError(err.response?.data?.detail || err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className={`${poppins.className} min-h-screen grid grid-cols-1 md:grid-cols-2`}>
      <div className="flex flex-col justify-center px-12">
        <h1 className="text-3xl font-bold mb-1">Welcome Back</h1>
        <p className="mb-6 text-sm">Log in to continue to your dashboard</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Enter your email"
            className="w-full p-2 border rounded mt-4"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Enter your password"
            className="w-full p-2 border rounded mt-4"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button className="bg-[#4a372a] text-white py-2 rounded w-full mt-4 mb-5">Login</button>
        </form>

        {error && <p className="text-red-500 mt-2">{error}</p>}


        <p className="text-sm mt-6 text-center">
          Don’t have an account? <a href="/signup" className="text-purple-600">Sign up</a>
        </p>
      </div>

      <div className="hidden md:block">
        <img src="/assets/singkai-lee-N_U3q6hU1Rs-unsplash.jpg" alt="Tent" className="h-full w-full object-cover" />
      </div>
    </div>
  );
}

export default LoginForm;
