import React, { useState } from 'react';
import {
  Card, CardContent, CardMedia, CardActions, Typography,
  IconButton, Tooltip, Box, Chip, Skeleton,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useAuth } from '../context/AuthContext';

export function AmiiboCardSkeleton() {
  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Skeleton variant="rectangular" height={200} />
      <CardContent sx={{ flexGrow: 1 }}>
        <Skeleton width="80%" height={24} />
        <Skeleton width="60%" height={20} sx={{ mt: 0.5 }} />
        <Skeleton width="50%" height={20} sx={{ mt: 0.5 }} />
      </CardContent>
    </Card>
  );
}

export default function AmiiboCard({ amiibo }) {
  const { user, getAmiiboStatus, toggleStatus } = useAuth();
  const [imgError, setImgError] = useState(false);
  const status = getAmiiboStatus(amiibo);

  const handleToggle = (category) => (e) => {
    e.preventDefault();
    if (!user) return;
    toggleStatus(amiibo, category);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
        position: 'relative',
        '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
      }}
    >
      {/* Status badges */}
      <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 0.5, zIndex: 1 }}>
        {status.owned && (
          <Chip label="Owned" size="small" color="success" sx={{ fontWeight: 700, fontSize: 11 }} />
        )}
        {status.favorite && (
          <Chip label="Fav" size="small" color="error" sx={{ fontWeight: 700, fontSize: 11 }} />
        )}
        {status.wanted && (
          <Chip label="Wanted" size="small" color="warning" sx={{ fontWeight: 700, fontSize: 11 }} />
        )}
      </Box>

      <CardMedia
        component="img"
        image={imgError ? '/placeholder-amiibo.png' : amiibo.image}
        alt={amiibo.name}
        onError={() => setImgError(true)}
        sx={{
          height: 200,
          objectFit: 'contain',
          bgcolor: 'grey.50',
          p: 1,
        }}
      />

      <CardContent sx={{ flexGrow: 1, pb: 0 }}>
        <Typography variant="subtitle1" fontWeight={700} noWrap title={amiibo.name}>
          {amiibo.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {amiibo.amiiboSeries}
        </Typography>
        <Typography variant="caption" color="text.disabled" noWrap>
          {amiibo.gameSeries}
        </Typography>
      </CardContent>

      {user && (
        <CardActions sx={{ justifyContent: 'space-around', pt: 0, px: 1 }}>
          <Tooltip title={status.favorite ? 'Remove from Favorites' : 'Add to Favorites'}>
            <IconButton size="small" onClick={handleToggle('favorite')} color={status.favorite ? 'error' : 'default'}>
              {status.favorite ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title={status.owned ? 'Mark as Not Owned' : 'Mark as Owned'}>
            <IconButton size="small" onClick={handleToggle('owned')} color={status.owned ? 'success' : 'default'}>
              {status.owned ? <CheckCircleIcon fontSize="small" /> : <CheckCircleOutlineIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title={status.wanted ? 'Remove from Wishlist' : 'Add to Wishlist'}>
            <IconButton size="small" onClick={handleToggle('wanted')} color={status.wanted ? 'warning' : 'default'}>
              {status.wanted ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </CardActions>
      )}
    </Card>
  );
}