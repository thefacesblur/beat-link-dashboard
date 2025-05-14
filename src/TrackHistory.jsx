import React, { useMemo } from 'react';
import { Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography, Box, Tabs, Tab } from '@mui/material';
import { FixedSizeList as VirtualList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import TrackAnalytics from './TrackAnalytics';
import { useSettings } from './SettingsContext';

// Memoized field rendering components
const TimeCell = ({ entry }) => (
  <TableCell sx={{ whiteSpace: 'nowrap', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
    {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
  </TableCell>
);

const DeckCell = ({ entry }) => (
  <TableCell sx={{ whiteSpace: 'nowrap', maxWidth: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
    {entry.player}
  </TableCell>
);

const ArtistCell = ({ entry }) => (
  <TableCell sx={{ wordBreak: 'break-word', maxWidth: '250px' }}>
    {entry.artist || 'Unknown Artist'}
  </TableCell>
);

const TitleCell = ({ entry }) => (
  <TableCell sx={{ wordBreak: 'break-word', maxWidth: '400px' }}>
    {entry.title || 'Unknown Title'}
  </TableCell>
);

const BpmCell = ({ entry }) => (
  <TableCell sx={{ whiteSpace: 'nowrap', maxWidth: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
    {entry.bpm || '-'}
  </TableCell>
);

const GenreCell = ({ entry }) => (
  <TableCell sx={{ wordBreak: 'break-word', maxWidth: '200px' }}>
    {entry.genre || 'Unknown'}
  </TableCell>
);

// Virtualized row component for TableBody
const VirtualizedRow = React.memo(({ data, index, style }) => {
  const { entry, fieldMap, trackHistoryFields } = data;
  
  return (
    <TableRow style={style}>
      {trackHistoryFields.map(field => {
        const CellComponent = fieldMap[field];
        return CellComponent ? <CellComponent key={field} entry={entry} /> : null;
      })}
    </TableRow>
  );
});

export default function TrackHistory({ history, players }) {
  const [tab, setTab] = React.useState(0);
  const { analyticsEnabled, trackHistoryFields } = useSettings ? useSettings() : { analyticsEnabled: true, trackHistoryFields: ['Time', 'Deck', 'Artist', 'Title', 'BPM', 'Genre'] };
  
  if (!history.length) return null;

  // Map field names to render components for better performance
  const fieldMap = useMemo(() => ({
    'Time': TimeCell,
    'Deck': DeckCell,
    'Artist': ArtistCell,
    'Title': TitleCell,
    'BPM': BpmCell,
    'Genre': GenreCell,
  }), []);

  // Memoize the reversed history to avoid recalculation on each render
  const reversedHistory = useMemo(() => [...history].reverse(), [history]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <Paper sx={{ mt: 3, p: 2, overflowX: 'auto', borderRadius: 3 }}>
      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="History" />
        {analyticsEnabled && <Tab label="Analytics" />}
      </Tabs>
      {tab === 0 && (
        <Box sx={{ minWidth: 320, maxWidth: '100%', overflowX: 'auto' }}>
          <Typography variant="h6" gutterBottom>Track History</Typography>
          <Table size="small" sx={{ minWidth: 500 }}>
            <TableHead>
              <TableRow>
                {trackHistoryFields.map(field => (
                  <TableCell key={field} sx={{ fontWeight: 'bold' }}>{field}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Fixed height container for virtualized list */}
              <Box height={400} width="100%">
                <AutoSizer>
                  {({ height, width }) => (
                    <VirtualList
                      height={height}
                      width={width}
                      itemCount={reversedHistory.length}
                      itemSize={60} // Approximate row height
                      itemData={{
                        fieldMap,
                        trackHistoryFields,
                        entries: reversedHistory
                      }}
                    >
                      {({ index, style, data }) => (
                        <VirtualizedRow
                          data={{
                            entry: reversedHistory[index],
                            fieldMap,
                            trackHistoryFields
                          }}
                          index={index}
                          style={style}
                        />
                      )}
                    </VirtualList>
                  )}
                </AutoSizer>
              </Box>
            </TableBody>
          </Table>
        </Box>
      )}
      {tab === 1 && analyticsEnabled && <TrackAnalytics history={history} />}
    </Paper>
  );
}
