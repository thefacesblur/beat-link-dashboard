import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Paper } from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

const COLORS = ['#29D9B9', '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c', '#d0ed57', '#d8854f', '#a28fd0'];

export default function AdvancedAnalytics({ history }) {
  if (!history || history.length === 0) {
    return (
      <Box sx={{ mt: 2, textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">
          No data available yet. Start playing tracks to see analytics!
        </Typography>
      </Box>
    );
  }

  // Basic stats
  const totalTracks = history.length;
  const uniqueArtists = new Set(history.map(e => e.artist)).size;
  const validBpms = history.map(e => Number(e.bpm)).filter(bpm => !isNaN(bpm) && bpm > 0);
  const avgBpm = validBpms.length ? (validBpms.reduce((a, b) => a + b, 0) / validBpms.length).toFixed(1) : 'N/A';

  const start = history[0].timestamp;
  const end = history[history.length - 1].timestamp;
  const durationMs = end - start;
  const durationMin = durationMs > 0 ? (durationMs / 60000).toFixed(1) : 'N/A';

  // Calculate average mix time (time between tracks)
  const mixTimes = [];
  for (let i = 1; i < history.length; i++) {
    const timeDiff = (history[i].timestamp - history[i - 1].timestamp) / 1000; // in seconds
    if (timeDiff > 0 && timeDiff < 600) { // Only count if less than 10 minutes
      mixTimes.push(timeDiff);
    }
  }
  const avgMixTime = mixTimes.length > 0
    ? (mixTimes.reduce((a, b) => a + b, 0) / mixTimes.length).toFixed(0)
    : 'N/A';

  // BPM Transition Analysis - shows BPM over time
  const bpmTransitionData = history.map((entry, idx) => ({
    index: idx + 1,
    bpm: Number(entry.bpm) || 0,
    time: new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    track: `${entry.artist} - ${entry.title}`
  })).filter(d => d.bpm > 0);

  // Calculate BPM transitions (increases/decreases)
  const bpmIncreases = bpmTransitionData.filter((d, i) => i > 0 && d.bpm > bpmTransitionData[i - 1].bpm).length;
  const bpmDecreases = bpmTransitionData.filter((d, i) => i > 0 && d.bpm < bpmTransitionData[i - 1].bpm).length;

  // Genre Distribution
  const genreCounts = {};
  history.forEach(track => {
    const genre = track.genre && track.genre !== 'Unknown' ? track.genre : 'Unknown';
    genreCounts[genre] = (genreCounts[genre] || 0) + 1;
  });
  const genreData = Object.entries(genreCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Track Popularity - Most played artists
  const artistCounts = {};
  history.forEach(track => {
    const artist = track.artist || 'Unknown';
    artistCounts[artist] = (artistCounts[artist] || 0) + 1;
  });
  const topArtists = Object.entries(artistCounts)
    .map(([artist, count]) => ({ artist, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Time-based heatmap data - tracks by hour
  const hourCounts = {};
  history.forEach(track => {
    const hour = new Date(track.timestamp).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  const hourData = Object.entries(hourCounts)
    .map(([hour, count]) => ({
      hour: `${hour}:00`,
      count,
      hourNum: parseInt(hour)
    }))
    .sort((a, b) => a.hourNum - b.hourNum);

  // Key harmony analysis
  const keyCounts = {};
  history.forEach(track => {
    if (track.key) {
      const key = track.key;
      keyCounts[key] = (keyCounts[key] || 0) + 1;
    }
  });
  const keyData = Object.entries(keyCounts)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  // Deck usage
  const deckCounts = {};
  history.forEach(track => {
    const deck = `Deck ${track.player}`;
    deckCounts[deck] = (deckCounts[deck] || 0) + 1;
  });
  const deckData = Object.entries(deckCounts).map(([name, value]) => ({ name, value }));

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>Advanced Analytics</Typography>

      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Total Tracks</Typography>
              <Typography variant="h5">{totalTracks}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Unique Artists</Typography>
              <Typography variant="h5">{uniqueArtists}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Avg BPM</Typography>
              <Typography variant="h5">{avgBpm}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Duration (min)</Typography>
              <Typography variant="h5">{durationMin}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Avg Mix (sec)</Typography>
              <Typography variant="h5">{avgMixTime}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">BPM Changes</Typography>
              <Typography variant="h5" color="success.main">↑{bpmIncreases}</Typography>
              <Typography variant="h5" color="error.main">↓{bpmDecreases}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={2}>
        {/* BPM Transition Analysis */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>BPM Energy Flow</Typography>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Track how your set's energy changes over time
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={bpmTransitionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" label={{ value: 'Track #', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'BPM', angle: -90, position: 'insideLeft' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="bpm" stroke="#29D9B9" fill="#29D9B9" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Genre Distribution */}
        <Grid item xs={12} sm={6} lg={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Genre Distribution</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={genreData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Artists */}
        <Grid item xs={12} sm={6} lg={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Top 10 Artists</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topArtists} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="artist" type="category" width={120} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#29D9B9" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Time-based Activity */}
        <Grid item xs={12} sm={6} lg={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Activity by Hour</Typography>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              When did you play the most tracks?
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Key Distribution */}
        {keyData.length > 0 && (
          <Grid item xs={12} sm={6} lg={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Key Distribution</Typography>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                Musical keys used in your set
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={keyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="key" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* Deck Usage */}
        <Grid item xs={12} sm={6} lg={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Deck Usage</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deckData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deckData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

// Custom tooltip for BPM chart
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ p: 1.5 }}>
        <Typography variant="body2"><strong>Track:</strong> {payload[0].payload.track}</Typography>
        <Typography variant="body2"><strong>BPM:</strong> {payload[0].value}</Typography>
        <Typography variant="body2"><strong>Time:</strong> {payload[0].payload.time}</Typography>
      </Paper>
    );
  }
  return null;
};

// Custom label for pie charts
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  if (percent < 0.05) return null; // Don't show label if less than 5%
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
      {`${name} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
};
