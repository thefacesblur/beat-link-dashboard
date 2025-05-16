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
  // Track the first occurrence of each player+trackId combination
  const uniqueTracks = new Map();
  
  // Process entries in chronological order (keep first occurrence)
  history.forEach(entry => {
    const key = `${entry.player}-${entry.trackId}`;
    if (!uniqueTracks.has(key)) {
      uniqueTracks.set(key, entry);
    }
  });
  
  // Return deduplicated array sorted by timestamp
  return Array.from(uniqueTracks.values())
    .sort((a, b) => a.timestamp - b.timestamp);
}

// Use this as a utility function to check duplicates
function isDuplicateTrack(history, newTrack) {
  // Check if this track was already played on this deck
  const lastEntry = [...history].reverse().find(e => e.player === newTrack.player);
  if (lastEntry && lastEntry.trackId === newTrack.trackId) {
    // If it's the same track on the same deck, check if it's too soon for a genuine replay
    // (5 seconds threshold to avoid double-detection)
    return Math.abs(lastEntry.timestamp - newTrack.timestamp) < 5000;
  }
  return false;
}

const TIMELINE_ID = 'dj-set-timeline';
const HISTORY_ID = 'track-history';

export default function Dashboard({ params }) {
  const [history, setHistory] = useState([]);
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

  // Fetch history on component mount
  useEffect(() => {
    fetch('/api/track-history')
      .then(res => res.json())
      .then(data => {
        // Apply deduplication to the server data just to be safe
        setHistory(dedupeHistory(data));
      })
      .catch(err => {
        console.error("Failed to fetch track history:", err);
      });
  }, []);

  // Modified "clean history" effect that runs on component mount
  useEffect(() => {
    console.log("Component mounted, cleaning and fetching history");
    
    // First, explicitly clean the history on the server
    fetch('/api/track-history/clean', { 
      method: 'PATCH' 
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to clean track history');
      return res.json();
    })
    .then(data => {
      console.log("History cleaned:", data);
      
      // Now fetch the cleaned history
      return fetch('/api/track-history');
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch track history');
      return res.json();
    })
    .then(data => {
      console.log(`Fetched ${data.length} history entries`);
      setHistory(data);
    })
    .catch(err => {
      console.error("History operation failed:", err);
      // Try a simple fetch as fallback
      fetch('/api/track-history')
        .then(res => res.json())
        .then(data => setHistory(data));
    });
  }, []);  // Empty dependency array means this runs once on mount

  // Modified track detection to be more reliable
  useEffect(() => {
    if (!players || players.length === 0) return;
    
    // Map of player number to last processed track ID 
    const lastProcessedTracks = useRef(new Map());
    
    players.forEach(player => {
      if (!player.track?.id) return;
      
      const { number, track } = player;
      const trackId = track.id;
      
      // Skip if we've already processed this exact track for this player
      if (lastProcessedTracks.current.get(number) === trackId) {
        return;
      }
      
      // Update our reference of processed tracks
      lastProcessedTracks.current.set(number, trackId);
      
      // Check if this track is already in our history
      const trackExists = history.some(
        entry => entry.player === number && entry.trackId === trackId
      );
      
      // Skip adding if it already exists
      if (trackExists) {
        console.log(`Skipping duplicate track: ${track.artist} - ${track.title} on deck ${number}`);
        return;
      }
      
      console.log(`New track detected: ${track.artist} - ${track.title} on deck ${number}`);
      
      const newTrack = {
        timestamp: Date.now(),
        player: number,
        artist: track.artist || 'Unknown Artist',
        title: track.title || 'Unknown Title',
        bpm: track.bpm || player['track-bpm'] || 0,
        duration: track.duration || 0,
        trackId,
        genre: track.genre || 'Unknown',
        key: track.key || 'Unknown',
      };
      
      // Send to server
      fetch('/api/track-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTrack)
      })
      .then(res => res.json())
      .then(data => {
        if (data.added) {
          console.log(`Track added to history: ${newTrack.artist} - ${newTrack.title}`);
          
          // Refresh our history from server to stay in sync
          fetch('/api/track-history')
            .then(res => res.json())
            .then(serverHistory => {
              setHistory(serverHistory);
            });
        } else {
          console.log(`Server rejected track as duplicate: ${newTrack.artist} - ${newTrack.title}`);
        }
      })
      .catch(err => {
        console.error("Failed to add track to history:", err);
      });
    });
  }, [players, history]);

  // Handle API errors
  useEffect(() => {
    if (!params) {
      setError(new Error("Failed to fetch data from API"));
    } else {
      setError(null); // Clear error if data is fetched successfully
    }
  }, [params]);

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

  // Update Reset button handler
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the session?')) {
      fetch('/api/track-history', { method: 'DELETE' })
        .then(res => res.json())
        .then(() => {
          setHistory([]);
        })
        .catch(err => {
          console.error("Failed to reset track history:", err);
        });
    }
  };

  // Clean button handler (for debugging)
  const handleCleanDuplicates = () => {
    fetch('/api/track-history/clean', { method: 'PATCH' })
      .then(res => res.json())
      .then(data => {
        console.log("Clean response:", data);
        return fetch('/api/track-history');
      })
      .then(res => res.json())
      .then(data => {
        console.log(`Fetched ${data.length} cleaned entries`);
        setHistory(data);
      })
      .catch(err => {
        console.error("Failed to clean duplicates:", err);
      });
  };

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
          onClick={handleReset}
        >
          Restart History Session
        </Button>
        <Button 
          variant="outlined" 
          onClick={handleCleanDuplicates}
          sx={{ mb: 2, mt: 2, mr: 1 }}
        >
          Clean Duplicates
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

  // Ensure we're exporting deduplicated history
  const dedupedHistory = dedupeHistory(history);
  
  let content = '';
  const dateStamp = new Date().toISOString().split('T')[0];
  let filename = `track_history_${dateStamp}.${format}`;

  if (format === 'json') {
    content = JSON.stringify(dedupedHistory, null, 2);
  } else if (format === 'csv') {
    const header = Object.keys(dedupedHistory[0]).join(',');
    const rows = dedupedHistory.map(entry =>
      Object.values(entry).map(val =>
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(',')
    );
    content = [header, ...rows].join('\n');
  } else if (format === 'txt') {
    content = dedupedHistory.map(entry =>
      `${new Date(entry.timestamp).toLocaleString()} | Deck ${entry.player} | ${entry.artist} - ${entry.title} | BPM: ${entry.bpm}`
    ).join('\n');
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
