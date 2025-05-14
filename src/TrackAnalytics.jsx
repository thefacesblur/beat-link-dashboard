import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// Color palette matching your existing dashboard theme
const GENRE_COLORS = [
  '#82ca9d', // House (mint green - matches your progress bars)
  '#8884d8', // Unknown (purple)
  '#ff8042', // Deep House (orange)
  '#ffc658', // Techno (yellow)
  '#a4de6c', // Electro (light green)
  '#8dd1e1', // Melodic House & Techno (light blue)
  '#d0ed57', // Progressive House (lime)
  '#ff7c7c', // Electronic (red)
  '#a28fd0'  // Other (light purple)
];

// Custom pie chart label renderer
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  if (percent < 0.05) return null; // Don't show labels for small segments
  
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 1.2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="#e0e0e0"
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
    >
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Custom tooltip that matches dashboard style
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        backgroundColor: '#2a2a2a', 
        border: '1px solid #444',
        padding: '8px 12px',
        borderRadius: '4px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
        color: '#e0e0e0',
        fontSize: '13px'
      }}>
        <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>{payload[0].payload.name || label}</p>
        <p style={{ margin: 0 }}>
          {payload[0].name === 'count' ? `${payload[0].value} tracks` : `${payload[0].value}`}
          {payload[0].payload.percent ? ` (${(payload[0].payload.percent * 100).toFixed(1)}%)` : ''}
        </p>
      </div>
    );
  }
  return null;
};

export default function TrackAnalytics({ history }) {
  if (!history || !history.length) return null;

  // Total tracks
  const totalTracks = history.length;
  // Unique artists
  const uniqueArtists = new Set(history.map(e => e.artist)).size;
  // Average BPM
  const validBpms = history.map(e => Number(e.bpm)).filter(bpm => !isNaN(bpm));
  const avgBpm = validBpms.length ? (validBpms.reduce((a, b) => a + b, 0) / validBpms.length).toFixed(1) : 'N/A';
  // Set duration
  const start = history[0].timestamp;
  const end = history[history.length - 1].timestamp;
  const durationMs = end - start;
  const durationMin = durationMs > 0 ? (durationMs / 60000).toFixed(1) : 'N/A';

  // BPM Histogram
  const bpmBuckets = {};
  validBpms.forEach(bpm => {
    bpmBuckets[bpm] = (bpmBuckets[bpm] || 0) + 1;
  });
  
  const bpmData = Object.keys(bpmBuckets)
    .sort((a, b) => Number(a) - Number(b))
    .map(bpm => ({
      bpm: bpm.toString(),
      count: bpmBuckets[bpm]
    }));

  // Genre Distribution
  const genreCounts = {};
  history.forEach(entry => {
    const genre = entry.genre || 'Unknown';
    genreCounts[genre] = (genreCounts[genre] || 0) + 1;
  });
  
  const genreData = Object.entries(genreCounts)
    .map(([name, value]) => ({ 
      name, 
      value,
      percent: value / totalTracks
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Stats Row */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Box sx={{ 
          flex: '1 1 calc(25% - 16px)',
          minWidth: '150px',
          p: 2, 
          bgcolor: '#1e1e1e', 
          borderRadius: 1,
        }}>
          <Typography variant="body2" color="#999" sx={{ mb: 0.5 }}>
            Total Tracks
          </Typography>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 500 }}>
            {totalTracks}
          </Typography>
        </Box>
        <Box sx={{ 
          flex: '1 1 calc(25% - 16px)',
          minWidth: '150px',
          p: 2, 
          bgcolor: '#1e1e1e', 
          borderRadius: 1,
        }}>
          <Typography variant="body2" color="#999" sx={{ mb: 0.5 }}>
            Unique Artists
          </Typography>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 500 }}>
            {uniqueArtists}
          </Typography>
        </Box>
        <Box sx={{ 
          flex: '1 1 calc(25% - 16px)',
          minWidth: '150px',
          p: 2, 
          bgcolor: '#1e1e1e', 
          borderRadius: 1,
        }}>
          <Typography variant="body2" color="#999" sx={{ mb: 0.5 }}>
            Average BPM
          </Typography>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 500 }}>
            {avgBpm}
          </Typography>
        </Box>
        <Box sx={{ 
          flex: '1 1 calc(25% - 16px)',
          minWidth: '150px',
          p: 2, 
          bgcolor: '#1e1e1e', 
          borderRadius: 1,
        }}>
          <Typography variant="body2" color="#999" sx={{ mb: 0.5 }}>
            Set Duration (min)
          </Typography>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 500 }}>
            {durationMin}
          </Typography>
        </Box>
      </Box>
      
      {/* Charts Row - using flex instead of Grid for more direct control */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {/* BPM Distribution Chart */}
        <Box sx={{ 
          flex: '1 1 calc(50% - 16px)',
          minWidth: '300px',
          bgcolor: '#1e1e1e', 
          borderRadius: 1,
          overflow: 'hidden'
        }}>
          <Box sx={{ p: 2, pb: 0 }}>
            <Typography variant="body1" sx={{ color: '#fff', fontWeight: 500 }}>
              BPM Distribution
            </Typography>
          </Box>
          <Box sx={{ height: 350, width: '100%', p: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={bpmData}
                margin={{ top: 10, right: 10, left: 0, bottom: 25 }}
              >
                <XAxis 
                  dataKey="bpm" 
                  tick={{ fill: '#e0e0e0', fontSize: 12 }}
                  tickLine={{ stroke: '#555' }}
                  axisLine={{ stroke: '#555' }}
                />
                <YAxis 
                  allowDecimals={false} 
                  tick={{ fill: '#e0e0e0', fontSize: 12 }}
                  tickLine={{ stroke: '#555' }}
                  axisLine={{ stroke: '#555' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="#29D9B9"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
        
        {/* Genre Distribution Chart */}
        <Box sx={{ 
          flex: '1 1 calc(50% - 16px)',
          minWidth: '300px',
          bgcolor: '#1e1e1e', 
          borderRadius: 1,
          overflow: 'hidden'
        }}>
          <Box sx={{ p: 2, pb: 0 }}>
            <Typography variant="body1" sx={{ color: '#fff', fontWeight: 500 }}>
              Genre Distribution
            </Typography>
          </Box>
          <Box sx={{ height: 350, width: '100%', p: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={genreData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={100}
                  innerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                  label={renderCustomizedLabel}
                  nameKey="name"
                >
                  {genreData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={GENRE_COLORS[index % GENRE_COLORS.length]} 
                      stroke="#272727"
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  formatter={(value) => <span style={{ color: '#e0e0e0', fontSize: '12px' }}>{value}</span>}
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}