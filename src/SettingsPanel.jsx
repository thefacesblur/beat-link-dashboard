import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, FormLabel, RadioGroup, Radio, FormControlLabel, Switch, Checkbox, FormGroup, Slider, Box, Typography, IconButton, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSettings } from './SettingsContext';

export default function SettingsPanel({ open, onClose }) {
  const {
    pollingInterval, setPollingInterval,
    theme, setTheme,
    analyticsEnabled, setAnalyticsEnabled,
    trackHistoryFields, setTrackHistoryFields,
    defaultFields
  } = useSettings();

  const handleFieldChange = (field) => (e) => {
    if (e.target.checked) {
      setTrackHistoryFields([...trackHistoryFields, field]);
    } else {
      setTrackHistoryFields(trackHistoryFields.filter(f => f !== field));
    }
  };

  const handlePollingChange = (newInterval) => {
    setPollingInterval(newInterval);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        Settings
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth>
            <FormLabel>Polling Interval (ms)</FormLabel>
            <TextField
              type="number"
              value={pollingInterval}
              onChange={e => handlePollingChange(Number(e.target.value))}
              inputProps={{ min: 100, step: 100 }}
              size="small"
            />
          </FormControl>
        </Box>
        <Box sx={{ mb: 2 }}>
          <FormControl component="fieldset">
            <FormLabel>Theme</FormLabel>
            <RadioGroup
              row
              value={theme}
              onChange={e => setTheme(e.target.value)}
            >
              <FormControlLabel value="light" control={<Radio />} label="Light" />
              <FormControlLabel value="dark" control={<Radio />} label="Dark" />
              <FormControlLabel value="system" control={<Radio />} label="System" />
            </RadioGroup>
          </FormControl>
        </Box>
        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={<Switch checked={analyticsEnabled} onChange={e => setAnalyticsEnabled(e.target.checked)} />}
            label="Enable Analytics"
          />
        </Box>
        <Box>
          <FormLabel>Track History Fields</FormLabel>
          <FormGroup>
            {defaultFields.map(field => (
              <FormControlLabel
                key={field}
                control={
                  <Checkbox
                    checked={trackHistoryFields.includes(field)}
                    onChange={handleFieldChange(field)}
                  />
                }
                label={field}
              />
            ))}
          </FormGroup>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  );
} 