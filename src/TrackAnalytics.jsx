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
      {/* Title is already in the main component, don't repeat "Analytics" heading */}
      
      {/* Stats Cards - Match the existing dashboard aesthetic */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Box sx={{ 
            p: 2, 
            bgcolor: '#1e1e1e', 
            borderRadius: 1,
            height: '100%'
          }}>
            <Typography variant="body2" color="#999" sx={{ mb: 1 }}>
              Total Tracks
            </Typography>
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 500 }}>
              {totalTracks}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Box sx={{ 
            p: 2, 
            bgcolor: '#1e1e1e', 
            borderRadius: 1,
            height: '100%'
          }}>
            <Typography variant="body2" color="#999" sx={{ mb: 1 }}>
              Unique Artists
            </Typography>
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 500 }}>
              {uniqueArtists}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Box sx={{ 
            p: 2, 
            bgcolor: '#1e1e1e', 
            borderRadius: 1,
            height: '100%'
          }}>
            <Typography variant="body2" color="#999" sx={{ mb: 1 }}>
              Average BPM
            </Typography>
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 500 }}>
              {avgBpm}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Box sx={{ 
            p: 2, 
            bgcolor: '#1e1e1e', 
            borderRadius: 1,
            height: '100%'
          }}>
            <Typography variant="body2" color="#999" sx={{ mb: 1 }}>
              Set Duration (min)
            </Typography>
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 500 }}>
              {durationMin}
            </Typography>
          </Box>
        </Grid>
      </Grid>
      
      {/* Charts - styled to match the dashboard */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box sx={{ 
            p: 3, 
            bgcolor: '#1e1e1e', 
            borderRadius: 1,
            height: '100%',
            minHeight: 350
          }}>
            <Typography variant="subtitle1" sx={{ mb: 2, color: '#fff', textAlign: 'center' }}>
              BPM Distribution
            </Typography>
            <Box sx={{ height: 300, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={bpmData}
                  margin={{ top: 5, right: 5, left: -20, bottom: 20 }}
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
                    width={30}
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
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ 
            p: 3, 
            bgcolor: '#1e1e1e', 
            borderRadius: 1,
            height: '100%',
            minHeight: 350
          }}>
            <Typography variant="subtitle1" sx={{ mb: 2, color: '#fff', textAlign: 'center' }}>
              Genre Distribution
            </Typography>
            <Box sx={{ height: 300, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genreData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={90}
                    innerRadius={40}
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
                    wrapperStyle={{ 
                      paddingTop: '15px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}