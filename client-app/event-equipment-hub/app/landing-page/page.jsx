'use client';
import Link from 'next/link';
import 'bootstrap/dist/css/bootstrap.min.css';
import withAuth from '@/utils/withauth';


const categories = [
  { label: 'Tents', image: '/pages/media/davidcohen-i1x2BO7CSBI-unsplash.jpg', btnClass: 'btn-custom-labelled' },
  { label: 'Chairs', image: '/pages/media/eugene-chystiakov-3neSwyntbQ8-unsplash.jpg', btnClass: 'btn-light' },
  { label: 'Tables', image: '/pages/media/sq-lim-Cw35iZ-CCos-unsplash.jpg', btnClass: 'btn-light' },
  { label: 'Lighting', image: '/pages/media/patrick-tomasso-1NTFSnV-KLs-unsplash.jpg', btnClass: 'btn-light' },
  { label: 'Sound', image: '/pages/media/kevin-woblick-LRamvPjq5Ho-unsplash.jpg', btnClass: 'btn-light' },
];

function LandingPage() {
  return (
    <div style={{ backgroundColor: 'white' }}>
      <style jsx>{`
        .btn-custom {
          background-color: #847568;
          color: white;
          border: none;
        }
        .btn-custom:hover {
          background-color: #5A464C;
          color: black;
        }
        .btn-custom-2 {
          background-color: #f5f3e3;
          color: black;
        }
        .btn-custom-2:hover {
          background-color: #5A464C;
          color: black;
        }
        .btn-custom-labelled {
          background-color: #847568;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 14px;
        }
        .btn-custom-labelled:hover {
          background-color: #5A464C;
          color: black;
        }
        .category-img-wrapper {
          width: 100%;
          height: 200px;
          overflow: hidden;
          border-radius: 8px;
        }
        .category-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      `}</style>


      {/* Hero */}
      <section className="container my-5">
        <div className="row align-items-center">
          <div className="col-md-6">
            <h1 className="display-4 fw-bold">Make Every Event Unforgettable</h1>
            <p className="lead text-secondary">From lighting to sound, we've got the gear that powers your vision.</p>
            <h2 className="h4 fw-semibold mt-3">Explore. Rent. Own. — All in One Place.</h2>
            <button className="mt-3">
              <Link className="btn btn-custom rounded-3 px-4" href="/signup">Get Started</Link>
            </button>
          </div>
          <div className="col-md-6 text-center">
            <img src="http://localhost:8000/media/downloaded_images/a-j-cDzE3EmezpE-unsplash.jpg" alt="Event Equipment" className="img-fluid" style={{ maxHeight: '400px' }} />
          </div>
        </div>
      </section>

      {/* Categories */}
      <div className="container py-5">
        <h3 className="mb-4">Popular Categories</h3>
        <div className="row text-center gap-3">
          {categories.map((cat, idx) => (
            <div key={idx} className="col-md-2 col-6 mb-4">
              <div className="text-center">
                <div className="category-img-wrapper mb-2">
                  <img src={cat.image} alt={cat.label} className="img-fluid category-img" />
                </div>
                <div className={`btn ${cat.btnClass} btn-sm mt-2 px-3 rounded-pill`}>{cat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
