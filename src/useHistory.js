import { useEffect, useState, useCallback } from 'react';

// Server returns rows with: id, session_id, played_at, player, track_id,
// artist, title, bpm, key, genre, duration_seconds (newest-first).
// Existing components expect: timestamp, player, artist, title, bpm,
// duration, trackId, genre. Map between them here.
function adaptRow(r) {
  return {
    timestamp: r.played_at ? Date.parse(r.played_at) : Date.now(),
    player: r.player,
    artist: r.artist,
    title: r.title,
    bpm: r.bpm,
    duration: r.duration_seconds,
    trackId: r.track_id,
    genre: r.genre || 'Unknown',
  };
}

export default function useHistory(apiBase, sessionId, refreshIntervalMs = 5000) {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    if (!apiBase) {
      setHistory([]);
      return;
    }
    try {
      const qs = sessionId ? `?session=${sessionId}` : '';
      const res = await fetch(`${apiBase}/history${qs}`);
      if (!res.ok) throw new Error('history fetch failed');
      const rows = await res.json();
      // Server returns newest-first; existing UI assumes oldest-first append order.
      setHistory(rows.map(adaptRow).reverse());
    } catch (e) {
      setError(e);
    }
  }, [apiBase, sessionId]);

  useEffect(() => {
    fetchHistory();
    const t = setInterval(fetchHistory, refreshIntervalMs);
    return () => clearInterval(t);
  }, [fetchHistory, refreshIntervalMs]);

  return { history, error, refresh: fetchHistory };
}
