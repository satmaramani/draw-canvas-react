import React, { useState } from 'react';
import './ImageFilters.css'; // we'll define filter styles here

const FILTERS = [
  { name: 'Original', class: '' },
  { name: 'Black and White', class: 'filter-bw' },
  { name: 'Vintage', class: 'filter-vintage' },
  { name: 'Bright', class: 'filter-bright' },
  { name: 'Cool', class: 'filter-cool' },
  { name: 'Soft', class: 'filter-soft' },
];

const ImageFilters = () => {
  const [imageURL, setImageURL] = useState(null);
  const [filterClass, setFilterClass] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageURL(URL.createObjectURL(file));
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Apply Filters to Image</h2>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <div style={{ marginTop: '20px' }}>
        {imageURL && (
          <img
            src={imageURL}
            alt="Uploaded"
            className={`main-image ${filterClass}`}
            style={{ width: '300px', borderRadius: '12px' }}
          />
        )}
      </div>

      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
        {FILTERS.map((filter) => (
          <div key={filter.name} onClick={() => setFilterClass(filter.class)} style={{ cursor: 'pointer' }}>
            <div className={`filter-thumbnail ${filter.class}`}>
              {imageURL ? (
                <img src={imageURL} alt={filter.name} />
              ) : (
                <div style={{ width: '80px', height: '80px', background: '#ccc' }} />
              )}
            </div>
            <div style={{ textAlign: 'center', marginTop: '5px' }}>{filter.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageFilters;
