import React, { useEffect, useState } from 'react';
import PlayerCard from './PlayerCard';
import { Typography, Box, Button, ButtonGroup, useTheme, useMediaQuery } from '@mui/material';
import TrackHistory from './TrackHistory';
import SetTimeline from './SetTimeline';
import SessionSelector from './SessionSelector';
import useHistory from './useHistory';
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

const TIMELINE_ID = 'dj-set-timeline';
const HISTORY_ID = 'track-history';

export default function Dashboard({ params, apiBase = '' }) {
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const { history } = useHistory(apiBase, selectedSessionId);
  const [activeId, setActiveId] = useState(null);

  const players = params.players
    ? Object.values(params.players).filter(p => p.number === 1 || p.number === 2)
    : [];

  const initialOrder = players.map(p => p.number);
  const [dashboardOrder, setDashboardOrder] = useState([
    ...initialOrder,
    TIMELINE_ID,
    HISTORY_ID
  ]);

  useEffect(() => {
    if (dashboardOrder.length === 0 && players.length > 0) {
      setDashboardOrder([
        ...players.map(p => p.number),
        TIMELINE_ID,
        HISTORY_ID
      ]);
    } else if (dashboardOrder.length > 0 && players.length > 0) {
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
          <TrackHistory history={history} />
        </SortableSection>
      );
    } else {
      const player = players.find(p => p.number === id);
      if (!player) return null;
      return (
        <SortableSection key={id} id={id}>
          <PlayerCard player={player} apiBase={apiBase} />
        </SortableSection>
      );
    }
  });

  return (
    <Box px={{ xs: 1, sm: 2, md: 4 }} py={2}>
      {apiBase && (
        <Box sx={{ mb: 2 }}>
          <SessionSelector
            apiBase={apiBase}
            value={selectedSessionId}
            onChange={setSelectedSessionId}
          />
        </Box>
      )}
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
            overflowX="hidden"
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
                  if (player) return <PlayerCard player={player} apiBase={apiBase} />;
                  return null;
                }
              })()
            : null}
        </DragOverlay>
      </DndContext>
      <Box sx={{ mb: 2, mt: 2, display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <ButtonGroup>
          <Button onClick={() => exportHistory(history, 'csv')}>Export CSV</Button>
          <Button onClick={() => exportHistory(history, 'json')}>Export JSON</Button>
          <Button onClick={() => exportHistory(history, 'txt')}>Export TXT</Button>
        </ButtonGroup>
      </Box>
    </Box>
  );
}

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
  let filename = `track_history.${format}`;
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
    filename = `track_history_${new Date().toISOString().split('T')[0]}.txt`;
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
