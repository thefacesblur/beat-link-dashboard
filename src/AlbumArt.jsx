import React, { memo } from 'react';
import { Box, CircularProgress, IconButton, Tooltip } from '@mui/material';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import RefreshIcon from '@mui/icons-material/Refresh';
import useMediaLoader from './hooks/useMediaLoader';

// Placeholder image URLs
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22150%22%20height%3D%22150%22%20viewBox%3D%220%200%20150%20150%22%3E%3Crect%20fill%3D%22%23222222%22%20width%3D%22150%22%20height%3D%22150%22%2F%3E%3Ctext%20fill%3D%22%23cccccc%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%20x%3D%2275%22%20y%3D%2275%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E';

const AlbumArt = memo(({ playerNumber, player, size = 80 }) => {
  // Determine the image URL for this player/track
  const imageUrl = player?.track?.artwork || player?.track?.['artwork-url'] || null;
  
  // Use the media loader hook for better image loading and error handling
  const { 
    loading, 
    error, 
    media: image, 
    loadMedia 
  } = useMediaLoader(imageUrl, 'image', {
    shouldPreload: !!imageUrl,
    placeholderUrl: PLACEHOLDER_IMAGE,
    timeout: 8000
  });

  // Calculate image dimensions based on provided size
  const imgSize = {
    width: size,
    height: size,
    objectFit: 'cover',
    borderRadius: 2
  };

  // Handle image loading retry
  const handleRetry = () => {
    if (imageUrl) {
      loadMedia(imageUrl);
    }
  };

  return (
    <Box
      sx={{
        width: size,
        height: size,
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 2,
        backgroundColor: 'rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}
    >
      {loading && (
        <CircularProgress 
          size={size / 3} 
          sx={{ position: 'absolute', zIndex: 1 }}
        />
      )}

      {error && (
        <Tooltip title="Failed to load album art">
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <BrokenImageIcon color="error" />
            <IconButton 
              size="small" 
              onClick={handleRetry} 
              sx={{ mt: 1 }}
              color="primary"
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Box>
        </Tooltip>
      )}

      {image ? (
        <img 
          src={image.src} 
          alt={`Album art for ${player?.track?.title || 'track'}`}
          style={imgSize}
          loading="lazy"
        />
      ) : (
        !loading && !error && (
          <img 
            src={PLACEHOLDER_IMAGE} 
            alt="No album art"
            style={imgSize}
          />
        )
      )}
    </Box>
  );
});

// Display name for debugging
AlbumArt.displayName = 'AlbumArt';

export default AlbumArt;
