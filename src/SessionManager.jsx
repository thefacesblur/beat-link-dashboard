import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Box,
  Typography,
  Chip,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

export default function SessionManager({
  open,
  onClose,
  sessions,
  currentSessionId,
  onSessionSelect,
  onSessionCreate,
  onSessionDelete,
  onSessionRename,
  onCompare
}) {
  const [newSessionName, setNewSessionName] = useState('');
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editName, setEditName] = useState('');

  const handleCreateSession = () => {
    if (newSessionName.trim()) {
      onSessionCreate(newSessionName.trim());
      setNewSessionName('');
    }
  };

  const handleRename = (sessionId) => {
    if (editName.trim()) {
      onSessionRename(sessionId, editName.trim());
      setEditingSessionId(null);
      setEditName('');
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (ms) => {
    if (!ms || ms <= 0) return 'N/A';
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Session Manager</DialogTitle>
      <DialogContent dividers>
        {/* Create new session */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Create New Session</Typography>
          <Box display="flex" gap={1}>
            <TextField
              size="small"
              fullWidth
              placeholder="Session name (e.g., Friday Night Set)"
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateSession()}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateSession}
              disabled={!newSessionName.trim()}
            >
              Create
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Sessions list */}
        <Typography variant="subtitle2" gutterBottom>
          Your Sessions ({sessions.length})
        </Typography>
        {sessions.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            No sessions yet. Create your first session above!
          </Typography>
        ) : (
          <List>
            {sessions.map((session) => (
              <ListItem
                key={session.id}
                button
                selected={session.id === currentSessionId}
                onClick={() => {
                  onSessionSelect(session.id);
                  onClose();
                }}
                sx={{
                  border: 1,
                  borderColor: session.id === currentSessionId ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                {editingSessionId === session.id ? (
                  <Box display="flex" gap={1} flex={1}>
                    <TextField
                      size="small"
                      fullWidth
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleRename(session.id)}
                      autoFocus
                    />
                    <Button size="small" onClick={() => handleRename(session.id)}>Save</Button>
                    <Button size="small" onClick={() => setEditingSessionId(null)}>Cancel</Button>
                  </Box>
                ) : (
                  <>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          {session.name}
                          {session.id === currentSessionId && (
                            <Chip label="Active" size="small" color="primary" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {formatDate(session.createdAt)}
                          </Typography>
                          <Typography variant="caption" display="block">
                            {session.tracks.length} tracks • {formatDuration(session.duration)}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSessionId(session.id);
                          setEditName(session.name);
                        }}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete session "${session.name}"?`)) {
                            onSessionDelete(session.id);
                          }
                        }}
                        disabled={sessions.length === 1}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </>
                )}
              </ListItem>
            ))}
          </List>
        )}

        {sessions.length >= 2 && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<CompareArrowsIcon />}
              onClick={() => {
                onCompare();
                onClose();
              }}
            >
              Compare Sessions
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
