import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const TrackGenreDistribution = ({ players }) => {
  // Prepare data for the pie chart
  const genreCount = {};

  // Count occurrences of each genre
  Object.values(players).forEach(player => {
    if (player.track) {
      const genre = player.track.genre;
      if (genre) {
        genreCount[genre] = (genreCount[genre] || 0) + 1;
      }
    }
  });

  // Convert the genre count object to an array for the PieChart
  const data = Object.entries(genreCount).map(([genre, count]) => ({
    name: genre,
    value: count,
  }));

  // Define colors for the pie chart
  const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

  return (
    <PieChart width={600} height={300}>
      <Pie
        data={data}
        cx={300}
        cy={150}
        labelLine={false}
        label={entry => entry.name}
        outerRadius={100}
        fill="#8884d8"
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
};

export default TrackGenreDistribution;
