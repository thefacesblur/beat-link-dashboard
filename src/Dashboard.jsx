import React, { useEffect, useRef, useState } from 'react';
import PlayerCard from './PlayerCard';
import { Typography, Box, Button, ButtonGroup, useTheme, useMediaQuery, Snackbar } from '@mui/material';
import TrackHistory from './TrackHistory';
import SetTimeline from './SetTimeline';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function dedupeHistory(history) {
  const seen = {};
  return history.filter(entry => {
    if (!seen[entry.player]) seen[entry.player] = new Set();
    if (seen[entry.player].has(entry.trackId)) {
      return false;
    } else {
      seen[entry.player].add(entry.trackId);
      return true;
    }
  });
}

const TIMELINE_ID = 'dj-set-timeline';
const HISTORY_ID = 'track-history';

export default function Dashboard({ params }) {
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('trackHistory');
    if (!saved) return [];
    const arr = JSON.parse(saved);
    return dedupeHistory(arr);
  });
  const lastTrackIds = useRef({});
  const [activeId, setActiveId] = useState(null);
  const [error, setError] = useState(null);

  const players = params.players
    ? Object.values(params.players).filter(p => p.number === 1 || p.number === 2)
    : [];



  // Store player order in state
  const initialOrder = players.map(p => p.number);
  // Dashboard sections: player numbers, timeline, history
  const [dashboardOrder, setDashboardOrder] = useState([
    ...initialOrder,
    TIMELINE_ID,
    HISTORY_ID
  ]);

  // Only set initial order if dashboardOrder is empty (first load)
  useEffect(() => {
    if (dashboardOrder.length === 0 && players.length > 0) {
      setDashboardOrder([
        ...players.map(p => p.number),
        TIMELINE_ID,
        HISTORY_ID
      ]);
    } else if (dashboardOrder.length > 0 && players.length > 0) {
      // Remove missing players, add new ones at the top
      setDashboardOrder(order => {
        const playerNums = players.map(p => p.number);
        const filtered = order.filter(
          id => id === TIMELINE_ID || id === HISTORY_ID || playerNums.includes(id)
        );
        const missing = playerNums.filter(num => !filtered.includes(num));
        return [...missing, ...filtered];
      });
    }
    // eslint-disable-next-line
  }, [players]);

  // Drag-and-drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Handle drag end
  function handleDragEnd(event) {
    const { active, over } = event;
    if (active.id !== over.id) {
      setDashboardOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  // Detect track changes and update history
  useEffect(() => {
    let now = Date.now();
    players.forEach(player => {
      const trackId = player.track?.id;
      if (!trackId) return;
      const lastEntry = [...history].reverse().find(e => e.player === player.number);
      if (!lastEntry || lastEntry.trackId !== trackId) {
        if (history.length && history[history.length - 1].timestamp === now) {
          now += 1;
        }
        setHistory(prev => [
          ...prev,
          {
            timestamp: now,
            player: player.number,
            artist: player.track.artist,
            title: player.track.title,
            bpm: player.track.bpm || player['track-bpm'],
            duration: player.track.duration,
            trackId,
            genre: player.track.genre || 'Unknown',
            key: player.track.key || 'Unknown',
          }
        ]);
        lastTrackIds.current[player.number] = trackId;
        
      }
    });
  }, [players]);

  // Handle API errors
  useEffect(() => {
    if (!params) {
      setError(new Error("Failed to fetch data from API"));
    } else {
      setError(null); // Clear error if data is fetched successfully
    }
  }, [params]);

  // Persist history in localStorage
  useEffect(() => {
    localStorage.setItem('trackHistory', JSON.stringify(history));
  }, [history]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Render dashboard sections in the current order
  const dashboardSections = dashboardOrder.map(id => {
    if (id === TIMELINE_ID) {
      return (
        <SortableSection key={id} id={id} gridColumn={isMobile ? undefined : '1 / -1'}>
          <SetTimeline history={history} />
        </SortableSection>
      );
    } else if (id === HISTORY_ID) {
      return (
        <SortableSection key={id} id={id} gridColumn={isMobile ? undefined : '1 / -1'}>
          <TrackHistory history={history} players={players} />
        </SortableSection>
      );
    } else {
      const player = players.find(p => p.number === id);
      if (!player) return null;
      return (
        <SortableSection key={id} id={id}>
          <PlayerCard player={player} />
        </SortableSection>
      );
    }
  });

  return (
    <Box px={{ xs: 1, sm: 2, md: 4 }} py={2}>
      <Snackbar
        open={!!error}
        message={error ? error.message : ''}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      />
      <Typography variant="h6" gutterBottom></Typography>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={event => setActiveId(event.active.id)}
        onDragEnd={event => {
          setActiveId(null);
          handleDragEnd(event);
        }}
        onDragCancel={() => setActiveId(null)}
      >
        <SortableContext
          items={dashboardOrder}
          strategy={rectSortingStrategy}
        >
          <Box
            display="grid"
            gridTemplateColumns={isMobile ? '1fr' : 'repeat(2, 1fr)'}
            gap={2}
            width="100%"
            maxWidth="100vw"
            sx={{ overflow: 'hidden' }}
          >
            {dashboardSections}
          </Box>
        </SortableContext>
        <DragOverlay>
          {activeId
            ? (() => {
                if (activeId === TIMELINE_ID) {
                  return <SetTimeline history={history} />;
                } else if (activeId === HISTORY_ID) {
                  return <TrackHistory history={history} />;
                } else {
                  const player = players.find(p => p.number === activeId);
                  if (player) return <PlayerCard player={player} />;
                  return null;
                }
              })()
            : null}
        </DragOverlay>
      </DndContext>
      <ButtonGroup sx={{ mb: 2, mt: 2, float: 'right', width: '100%', justifyContent: 'flex-end' }}>
        <Button onClick={() => exportHistory(history, 'csv')}>Export CSV</Button>
        <Button onClick={() => exportHistory(history, 'json')}>Export JSON</Button>
        <Button onClick={() => exportHistory(history, 'txt')}>Export TXT</Button>
        <Button
        variant="contained"
        color="primary"
        onClick={() => {
          if (window.confirm('Are you sure you want to reset the session?')) {
            setHistory([]);
            localStorage.removeItem('trackHistory');
          }
        }}
      >
        Restart History Session
      </Button>
      </ButtonGroup>
      
    </Box>
  );
}

// Sortable wrapper for dashboard sections (player cards, timeline, history)
function SortableSection({ id, children, gridColumn }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
    gridColumn: gridColumn || undefined
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

function exportHistory(history, format) {
  if (!history.length) return;

  let content = '';
  const dateStamp = new Date().toISOString().split('T')[0];
  let filename = `track_history_${dateStamp}.${format}`;

  if (format === 'json') {
    content = JSON.stringify(history, null, 2);
  } else if (format === 'csv') {
    const header = Object.keys(history[0]).join(',');
    const rows = history.map(entry =>
      Object.values(entry).map(val =>
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(',')
    );
    content = [header, ...rows].join('\n');
  } else if (format === 'txt') {
    content = history.map(entry =>
      `${new Date(entry.timestamp).toLocaleString()} | Deck ${entry.player} | ${entry.artist} - ${entry.title} | BPM: ${entry.bpm}`
    ).join('\n');
    filename = `track_history_${dateStamp}.txt`;
  }

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}
