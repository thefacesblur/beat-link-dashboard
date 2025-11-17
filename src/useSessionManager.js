import { useState, useEffect } from 'react';

const SESSIONS_STORAGE_KEY = 'dj-sessions';
const CURRENT_SESSION_KEY = 'current-session-id';

// Generate unique ID
const generateId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Calculate session statistics
const calculateSessionStats = (tracks) => {
  if (!tracks || tracks.length === 0) {
    return { duration: 0, avgBpm: 0, uniqueArtists: 0, genres: [] };
  }

  const start = tracks[0].timestamp;
  const end = tracks[tracks.length - 1].timestamp;
  const duration = end - start;

  const validBpms = tracks.map(t => Number(t.bpm)).filter(bpm => !isNaN(bpm) && bpm > 0);
  const avgBpm = validBpms.length > 0
    ? Math.round(validBpms.reduce((a, b) => a + b, 0) / validBpms.length)
    : 0;

  const uniqueArtists = new Set(tracks.map(t => t.artist).filter(Boolean)).size;

  const genreCounts = {};
  tracks.forEach(t => {
    if (t.genre && t.genre !== 'Unknown') {
      genreCounts[t.genre] = (genreCounts[t.genre] || 0) + 1;
    }
  });
  const genres = Object.keys(genreCounts).sort((a, b) => genreCounts[b] - genreCounts[a]);

  return { duration, avgBpm, uniqueArtists, genres };
};

export default function useSessionManager() {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
    const savedCurrentId = localStorage.getItem(CURRENT_SESSION_KEY);

    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        setSessions(parsed);

        // Set current session
        if (savedCurrentId && parsed.find(s => s.id === savedCurrentId)) {
          setCurrentSessionId(savedCurrentId);
        } else if (parsed.length > 0) {
          setCurrentSessionId(parsed[0].id);
        }
      } catch (e) {
        console.error('Failed to parse sessions:', e);
        // Create default session if parsing fails
        createDefaultSession();
      }
    } else {
      // No saved sessions, create default
      createDefaultSession();
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  // Save current session ID
  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem(CURRENT_SESSION_KEY, currentSessionId);
    }
  }, [currentSessionId]);

  const createDefaultSession = () => {
    const defaultSession = {
      id: generateId(),
      name: 'My First Session',
      createdAt: Date.now(),
      tracks: [],
      duration: 0,
      avgBpm: 0,
      uniqueArtists: 0,
      genres: []
    };
    setSessions([defaultSession]);
    setCurrentSessionId(defaultSession.id);
  };

  // Create new session
  const createSession = (name) => {
    const newSession = {
      id: generateId(),
      name: name || `Session ${new Date().toLocaleDateString()}`,
      createdAt: Date.now(),
      tracks: [],
      duration: 0,
      avgBpm: 0,
      uniqueArtists: 0,
      genres: []
    };
    setSessions(prev => [...prev, newSession]);
    setCurrentSessionId(newSession.id);
    return newSession.id;
  };

  // Delete session
  const deleteSession = (sessionId) => {
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== sessionId);
      // If deleting current session, switch to first available
      if (sessionId === currentSessionId && filtered.length > 0) {
        setCurrentSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Rename session
  const renameSession = (sessionId, newName) => {
    setSessions(prev =>
      prev.map(s => s.id === sessionId ? { ...s, name: newName } : s)
    );
  };

  // Update session tracks
  const updateSessionTracks = (sessionId, tracks) => {
    const stats = calculateSessionStats(tracks);
    setSessions(prev =>
      prev.map(s =>
        s.id === sessionId
          ? { ...s, tracks, ...stats }
          : s
      )
    );
  };

  // Switch to different session
  const switchSession = (sessionId) => {
    if (sessions.find(s => s.id === sessionId)) {
      setCurrentSessionId(sessionId);
    }
  };

  // Get current session
  const getCurrentSession = () => {
    return sessions.find(s => s.id === currentSessionId);
  };

  // Get current session tracks
  const getCurrentTracks = () => {
    const session = getCurrentSession();
    return session ? session.tracks : [];
  };

  return {
    sessions,
    currentSessionId,
    currentSession: getCurrentSession(),
    currentTracks: getCurrentTracks(),
    createSession,
    deleteSession,
    renameSession,
    updateSessionTracks,
    switchSession
  };
}
