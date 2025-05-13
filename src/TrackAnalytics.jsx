import React from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const GENRE_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c', '#d0ed57', '#d8854f', '#d0ed57', '#a28fd0'
];

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

  // BPM Histogram (individual tempos)
  const bpmBuckets = {};
  validBpms.forEach(bpm => {
    bpmBuckets[bpm] = (bpmBuckets[bpm] || 0) + 1;
  });
  const bpmData = Object.keys(bpmBuckets).sort((a, b) => a - b).map(bpm => ({
    bpm: bpm.toString(),
    count: bpmBuckets[bpm]
  }));

  return (
    <Box sx={{ mt: 2  }}>
      <Typography variant="h6" gutterBottom>Analytics</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Total Tracks</Typography>
              <Typography variant="h5">{totalTracks}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Unique Artists</Typography>
              <Typography variant="h5">{uniqueArtists}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Average BPM</Typography>
              <Typography variant="h5">{avgBpm}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Set Duration (min)</Typography>
              <Typography variant="h5">{durationMin}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <CardContent sx={{ flex: 1, width: '100%' }}>
              <Typography variant="subtitle1" gutterBottom sx={{ textAlign: 'center' }}>BPM Distribution</Typography>
              <Box sx={{ width: 600, height: 200, mx: 'auto' }}>
                <ResponsiveContainer width="90%" height="100%">
                  <BarChart data={bpmData}>
                    <XAxis dataKey="bpm" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#29D9B9" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 