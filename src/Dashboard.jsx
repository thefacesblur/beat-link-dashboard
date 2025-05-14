import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
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

// Memoized helper function
const dedupeHistory = (history) => {
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
};

const TIMELINE_ID = 'dj-set-timeline';
const HISTORY_ID = 'track-history';

// Memoized SortableSection component to prevent unnecessary re-renders
const SortableSection = React.memo(({ id, children, gridColumn }) => {
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
});

export default function Dashboard({ params }) {
  // Use initialization function for complex state to avoid re-computing on every render
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('trackHistory');
      if (saved) {
        const parsed = JSON.parse(saved);
        return dedupeHistory(parsed);
      }
    } catch (e) {
      console.error('Failed to parse saved history:', e);
    }
    return [];
  });
  
  const lastTrackIds = useRef({});
  const [activeId, setActiveId] = useState(null);
  const [error, setError] = useState(null);

  // Memoize players array to prevent unnecessary re-renders
  const players = useMemo(() => {
    return params.players
      ? Object.values(params.players).filter(p => p.number === 1 || p.number === 2)
      : [];
  }, [params.players]);

  // Memoize player numbers
  const initialOrder = useMemo(() => players.map(p => p.number), [players]);
  
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
  }, [players, dashboardOrder]);

  // Drag-and-drop sensors - memoize to prevent recreation on every render
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Handle drag end - memoize callback
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setDashboardOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  // Memoized track change handler
  const handleTrackChange = useCallback(() => {
    let now = Date.now();
    let historyUpdated = false;
    
    const newEntries = players.reduce((entries, player) => {
      const trackId = player.track?.id;
      if (!trackId) return entries;
      
      const lastTrackedId = lastTrackIds.current[player.number];
      if (lastTrackedId === trackId) return entries;
      
      // Add timestamp offset for multiple tracks loaded at once
      if (historyUpdated && entries.length && entries[entries.length - 1].timestamp === now) {
        now += 1;
      }
      
      lastTrackIds.current[player.number] = trackId;
      historyUpdated = true;
      
      return [
        ...entries,
        {
          timestamp: now,
          player: player.number,
          artist: player.track.artist,
          title: player.track.title,
          bpm: player.track.bpm || player['track-bpm'],
          duration: player.track.duration,
          trackId,
          genre: player.track.genre || 'Unknown',
        }
      ];
    }, []);
    
    if (newEntries.length) {
      setHistory(prev => [...prev, ...newEntries]);
    }
  }, [players]);

  // Detect track changes and update history
  useEffect(() => {
    handleTrackChange();
  }, [handleTrackChange]);

  // Handle API errors
  useEffect(() => {
    if (!params) {
      setError(new Error("Failed to fetch data from API"));
    } else {
      setError(null); // Clear error if data is fetched successfully
    }
  }, [params]);

  // Persist history in localStorage - debounce for performance
  useEffect(() => {
    const saveHistoryTimeout = setTimeout(() => {
      try {
        localStorage.setItem('trackHistory', JSON.stringify(history));
      } catch (e) {
        console.error('Failed to save history to localStorage:', e);
      }
    }, 500);
    
    return () => clearTimeout(saveHistoryTimeout);
  }, [history]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Memoize export functions to prevent recreation on each render
  const exportHistoryCSV = useCallback(() => exportHistory(history, 'csv'), [history]);
  const exportHistoryJSON = useCallback(() => exportHistory(history, 'json'), [history]);
  const exportHistoryTXT = useCallback(() => exportHistory(history, 'txt'), [history]);
  const resetHistory = useCallback(() => {
    if (window.confirm('Are you sure you want to reset the session?')) {
      setHistory([]);
      lastTrackIds.current = {};
      localStorage.removeItem('trackHistory');
    }
  }, []);

  // Memoize dashboard sections to prevent recreation on each render
  const dashboardSections = useMemo(() => {
    return dashboardOrder.map(id => {
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
  }, [dashboardOrder, history, isMobile, players]);

  // Memoize the drag overlay content
  const dragOverlayContent = useMemo(() => {
    if (!activeId) return null;
    
    if (activeId === TIMELINE_ID) {
      return <SetTimeline history={history} />;
    } else if (activeId === HISTORY_ID) {
      return <TrackHistory history={history} />;
    } else {
      const player = players.find(p => p.number === activeId);
      if (player) return <PlayerCard player={player} />;
      return null;
    }
  }, [activeId, history, players]);

  // Handle drag start (memoized callback)
  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);
  }, []);

  // Handle drag cancel (memoized callback)
  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

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
        onDragStart={handleDragStart}
        onDragEnd={(event) => {
          setActiveId(null);
          handleDragEnd(event);
        }}
        onDragCancel={handleDragCancel}
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
            overflowX="hidden"
          >
            {dashboardSections}
          </Box>
        </SortableContext>
        <DragOverlay>
          {dragOverlayContent}
        </DragOverlay>
      </DndContext>
      <ButtonGroup sx={{ mb: 2, mt: 2, float: 'right', width: '100%', justifyContent: 'flex-end' }}>
        <Button onClick={exportHistoryCSV}>Export CSV</Button>
        <Button onClick={exportHistoryJSON}>Export JSON</Button>
        <Button onClick={exportHistoryTXT}>Export TXT</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={resetHistory}
        >
          Restart History Session
        </Button>
      </ButtonGroup>
    </Box>
  );
}

// Export logic moved outside of component to avoid recreating on every render
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
