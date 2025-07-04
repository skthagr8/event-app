'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar, Nav, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Phudu as phuduFont } from 'next/font/google';

const Phudu = phuduFont({
  subsets: ['latin'],
  weight: '400',
  style: 'normal',
});

export default function MyNavbar() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsAuthenticated(!!token); // true if token exists
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    router.push('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <Navbar bg="light" className={`${Phudu.className} px-4`} expand="lg">
      <Navbar.Brand href="/listings" className="ms-3" style={{ fontWeight: 700 }}>
        EVENTORY
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        {/* Left side: Links */}
        <Nav className="me-auto ms-4">
          <Nav.Link href="/categories" style={{ fontWeight: 700 }} className="me-3">
            Categories
          </Nav.Link>
          {/* My current POSTED listings (User == vendor) */}
          <Nav.Link href="/my-listings" style={{ fontWeight: 700 }}>
            My uploaded Listings
          </Nav.Link>
          {/* My current BOOKINGS (User == renter) */}
          <Nav.Link href="/user-bookings" style={{ fontWeight: 700 }}>
          Rental Bookings
          </Nav.Link>
          {/* My current BO (User == renter) */}
          <Nav.Link href="/user-booking-payments" style={{ fontWeight: 700 }}>
           My Booking Payments
          </Nav.Link>
          {/* My current BOOKED listings that are MINE (User == vendor) */}
           <Nav.Link href="/user-purchase-payments" style={{ fontWeight: 700 }}>
            My Purchase Payments
          </Nav.Link>
           {/* My current BOOKED listings that are MINE (User == vendor) */}
           <Nav.Link href="/user-purchases" style={{ fontWeight: 700 }}>
            My Purchases
          </Nav.Link>
        </Nav>

        {/* Right side: Buttons */}
        <Nav className="ms-auto">
          <Button
            href="/post"
            style={{ backgroundColor: '#48392A', border: 'none' }}
            className="me-2"
          >
            SELL
          </Button>
          <Button
            href="/listings"
            style={{ backgroundColor: '#48392A', border: 'none' }}
            className="me-3"
          >
            HIRE
          </Button>
          <Button variant="outline-danger" style={{ backgroundColor: '#48392A', border: 'none'}} onClick={handleLogout}>
            Logout
          </Button>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}


