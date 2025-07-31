import React, { useState } from 'react';

const FILTERS = [
  { name: 'Caricature', endpoint: 'caricature' },
  { name: 'Wynwood Cartoon Walking', endpoint: 'wynwood' },
  { name: 'Classic Warhol', endpoint: 'warhol' },
  { name: 'Mondrian', endpoint: 'mondrian' },
  { name: 'Lichtenstein Pop Art', endpoint: 'lichtenstein' },
  { name: 'Color on Wall', endpoint: 'coloronwall' },
  { name: 'Ghibli Studio', endpoint: 'ghibli' },
  { name: 'Pencil Sketch', endpoint: 'pencilsketch' },
  { name: 'Mondrian AI Art', endpoint: 'mondrianart' },
];

const API_BASE = 'http://localhost:8000/filter'; // Change if deployed

const FilterGallery = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [filteredImages, setFilteredImages] = useState({});
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setFilteredImages({});
  };

  const applyFilters = async () => {
    if (!selectedFile) return;
    setLoading(true);

    const fetchFiltered = async (filter) => {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const response = await fetch(`${API_BASE}/${filter.endpoint}`, {
        method: 'POST',
        body: formData,
      });
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    };

    try {
      const results = await Promise.all(
        FILTERS.map(async (filter) => {
          const imageUrl = await fetchFiltered(filter);
          return { name: filter.name, url: imageUrl };
        })
      );

      const resultMap = {};
      results.forEach(({ name, url }) => {
        resultMap[name] = url;
      });
      setFilteredImages(resultMap);
    } catch (err) {
      console.error('Error applying filters:', err);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Upload Image and View 8 Filtered Styles</h2>

      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button onClick={applyFilters} disabled={!selectedFile || loading} style={{ marginLeft: '1rem' }}>
        {loading ? 'Processing...' : 'Apply Filters'}
      </button>

      {Object.keys(filteredImages).length > 0 && (
        <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {Object.entries(filteredImages).map(([name, url]) => (
            <div key={name} style={{ textAlign: 'center' }}>
              <h4>{name}</h4>
              <img src={url} alt={name} style={{ maxWidth: '100%', borderRadius: '8px', boxShadow: '0 0 5px rgba(0,0,0,0.2)' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterGallery;
