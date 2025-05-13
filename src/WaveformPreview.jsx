import React, { useEffect, useState, useRef } from 'react';
import { Box } from '@mui/material';

export default function WaveformPreview({ playerNumber, player }) {
  const [cacheBuster, setCacheBuster] = useState(Date.now());
  const imgRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    const interval = setInterval(() => {
      if (player && player['time-played'] && player['time-played']['raw-milliseconds'] !== undefined) {
        setCacheBuster(player['time-played']['raw-milliseconds']);
      } else {
        setCacheBuster(Date.now());
      }
    }, 500);
    return () => clearInterval(interval);
  }, [player]);

  const src = `/wave-preview/${playerNumber}?width=400&height=80&cb=${cacheBuster}`;

  useEffect(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    img.onload = () => {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        // If pixel is black (or nearly black)
        if (data[i] < 10 && data[i+1] < 10 && data[i+2] < 10) {
          data[i+3] = 0; // Set alpha to 0 (transparent)
        }
      }
      ctx.putImageData(imageData, 0, 0);
    };
  }, [src]);

  return (
    <div>
      <img
        ref={imgRef}
        src={src}
        alt={`Waveform preview for player ${playerNumber}`}
        style={{ display: 'none' }}
        crossOrigin="anonymous"
      />
      <canvas
        ref={canvasRef}
        width={400}
        height={80}
        style={{
          width: '100%',
          height: '85px',
          borderRadius: '8px',
          border: '0',
          background: 'transparent'
        }}
      />
    </div>
  );
}
