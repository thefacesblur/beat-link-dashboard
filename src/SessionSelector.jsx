import React, { useEffect, useState, useCallback } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, Button } from '@mui/material';

export default function SessionSelector({ apiBase, value, onChange }) {
  const [sessions, setSessions] = useState([]);

  const load = useCallback(async () => {
    if (!apiBase) return;
    try {
      const res = await fetch(`${apiBase}/sessions`);
      if (res.ok) setSessions(await res.json());
    } catch {}
  }, [apiBase]);

  useEffect(() => { load(); }, [load]);

  const startNew = async () => {
    const label = window.prompt('Session label (optional)') || null;
    const res = await fetch(`${apiBase}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label }),
    });
    if (res.ok) {
      const body = await res.json();
      await load();
      onChange?.(body.id);
    }
  };

  if (!apiBase) return null;

  return (
    <Box display="flex" gap={1} alignItems="center">
      <FormControl size="small" sx={{ minWidth: 220 }}>
        <InputLabel>Session</InputLabel>
        <Select
          label="Session"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        >
          <MenuItem value=""><em>Current</em></MenuItem>
          {sessions.map((s) => (
            <MenuItem key={s.id} value={s.id}>
              #{s.id} · {s.label || (s.started_at || '').slice(0, 16)} · {s.track_count} tracks
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button variant="outlined" size="small" onClick={startNew}>New session</Button>
    </Box>
  );
}
