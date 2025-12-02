// client/src/App.js
import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('report', file);

    try {
      const res = await axios.post('http://localhost:3001/api/analyze-report', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <h1>MedVision – Report Visualizer</h1>
      <p>Upload your medical PDF report to get a human-friendly summary and visual highlight.</p>

      <form onSubmit={handleSubmit}>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        <button type="submit" disabled={!file || loading}>
          {loading ? 'Analyzing...' : 'Analyze Report'}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: 30 }}>
          <h2>Summary</h2>
          <p><strong>Condition:</strong> {result.condition}</p>
          <p><strong>Causes:</strong> {result.causes}</p>

          <h3>Treatment / Management</h3>
          <ul>
            {Array.isArray(result.treatmentAdvice)
              ? result.treatmentAdvice.map((item, idx) => <li key={idx}>{item}</li>)
              : <li>{result.treatmentAdvice}</li>}
          </ul>

          <p><strong>Affected body part:</strong> {result.bodyPart}</p>

          <h3>Visual Highlight</h3>
          {result.imageResult ? (
            <img
              src={result.imageResult.imageBase64 ? `data:image/png;base64,${result.imageResult.imageBase64}` : ''}
              alt="Affected body part"
              style={{ width: '100%', maxWidth: 400 }}
            />
          ) : (
            <p>Image not available.</p>
          )}

          <p style={{ marginTop: 20, color: 'red', fontSize: '0.9rem' }}>
            {result.disclaimer}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
