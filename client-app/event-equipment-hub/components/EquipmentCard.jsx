// components/EquipmentCard.js
'use client';
import Image from 'next/image';
import { Card, Button, Badge, DropdownButton, Dropdown } from 'react-bootstrap';
import Link from 'next/link';

export default function EquipmentCard({ 
  id, title, price, rent_per_day, location, condition, is_premium, quantity, image_url
})
 {

  
  return (
    <Card style={{ maxWidth: '20rem' }}>
      <div
        style={{
          width: '100%',
          height: '250px',
          position: 'relative',
          overflow: 'hidden',
          borderTopLeftRadius: '0.375rem',
          borderTopRightRadius: '0.375rem',
          backgroundColor: '#f8f9fa',
        }}
      >
        <Image
          src={image_url}
          alt={title}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, 33vw"
        />

        {/* Condition Badge */}
        {condition === 'Brand New' && (
          <Badge
            bg="#43281C"
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              fontSize: '0.8rem',
              fontWeight: 'normal',
              padding: '0.4em 0.6em',
              backgroundColor: '#43281C', 
              color: '#FBF2C0'
            }}
          >
            Brand New
          </Badge>
        )}
      </div>

      <Card.Body style={{ display: 'flex', flexDirection: 'column' }}>
        <Card.Title
          style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
          }}
        >
          {title}
        </Card.Title>

        {/* Removed Condition Text */}
        {/* <Card.Text><strong>{condition}</strong></Card.Text> */}

        <Card.Text
          style={{
            fontSize: '1rem',
            color: '#6c757d',
            fontWeight: 'bold',
            marginBottom: '0rem',
          }}
        >
          {location}
        </Card.Text>

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '3rem',
            alignItems: 'center',
          }}
        >
          <div>
            <Card.Text className="mb-0">Price: </Card.Text>
            <strong style={{ fontSize: '1.2rem' }}>Ksh:{price}</strong>
          </div>

          <div>
            <Card.Text className="mb-0">Rent: </Card.Text>
            <strong style={{ fontSize: '1.2rem' }}>Ksh:{rent_per_day}</strong>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '1rem',
            alignItems: 'center',
          }}
        >
          <div className="d-flex align-items-center gap-3 mt-2">
            <Link href={`/listings/${id}`} passHref>
               <Button variant="secondary" style={{ backgroundColor: '#43281C', color: '#FBF2C0' }}>
                   See more
               </Button>
            </Link>
          
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
