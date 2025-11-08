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

function SignupForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    phone_number: '',  // if needed
  });

  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('"https://api.eventory-marketplace.store/signup/', formData);

      if (res.status === 201 || res.status === 200) {
        const { access, refresh, ...userData } = res.data;

        // Store tokens and user info
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        localStorage.setItem('user', JSON.stringify(userData));

        // Redirect to protected page
        router.push('/listings'); // or wherever you want to redirect after signup
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className={`${poppins.className} min-h-screen grid grid-cols-1 md:grid-cols-2`}>
      <div className="flex flex-col justify-center px-12">
        <h1 className="text-3xl font-bold mb-1">Become a member</h1>
        <p className="mb-6 text-sm">Your one-stop shop for event equipment</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Enter your name"
            className="w-full p-2 border rounded mt-4"
            value={formData.name}
            onChange={handleChange}
            required
          />
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
          <input
            name="phone_number"
            type="text"
            placeholder="Phone Number"
            className="w-full p-2 border rounded mt-4"
            value={formData.phone_number}
            onChange={handleChange}
          />
          <select
            name="role"
            className="w-full p-2 border rounded mt-4"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="">Select Option</option>
            <option value="renter">Renter</option>
            <option value="vendor">Vendor</option>
          </select>

          <button className="bg-[#4a372a] text-white py-2 rounded w-full mt-4">Signup</button>
        </form>

        {error && <p className="text-red-500 mt-2">{error}</p>}
        <p className="text-sm mt-4 text-center">
          Have an account? <a href="/login" className="text-amber-950">Sign in</a>
        </p>
      </div>

      <div className="hidden md:block">       
        <img src="/assets/singkai-lee-N_U3q6hU1Rs-unsplash.jpg" alt="Tent" className="h-full w-full object-cover" />
      </div>
    </div>
  );
}

export default SignupForm;
