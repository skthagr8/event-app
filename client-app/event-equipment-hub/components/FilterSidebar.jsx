'use client';
import { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function FilterSidebar({ filters, setFilters}) {


  // Handle input changes
  const handleChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Handle condition checkbox toggles
  const handleCheckbox = (e) => {
    setFilters((prev) => ({
      ...prev,
      condition: {
        ...prev.condition,
        [e.target.name]: e.target.checked,
      }
    }));
  };

  return (
    <div className="p-3 bg-light rounded shadow-sm">
      <h5>Filter Equipment</h5>

      {/* Max Price Slider */}
      <Form.Group controlId="priceRange" className="mb-3">
        <Form.Label>Max Price (KES): {filters.maxPrice}</Form.Label>
        <Form.Range
          name="maxPrice"
          min={0}
          max={200000}
          step={5000}
          value={filters.maxPrice}
          onChange={handleChange}
        />
      </Form.Group>

      {/* Condition Checkboxes */}
      <Form.Group className="mb-3">
        <Form.Label>Condition</Form.Label>
        <Form.Check
          type="checkbox"
          label="Brand New"
          name="New"
          checked={filters.condition.New}
          onChange={handleCheckbox}
        />
        <Form.Check
          type="checkbox"
          label="Used"
          name="Used"
          checked={filters.condition.Used}
          onChange={handleCheckbox}
        />
      </Form.Group>
    </div>
  );
}
