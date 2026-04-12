import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Container, Typography, Grid2 as Grid, Tabs, Tab, Alert,
  Chip, Divider, CircularProgress,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import AmiiboCard, { AmiiboCardSkeleton } from '../components/AmiiboCard';
import SearchBar from '../components/SearchBar';
import { amiiboApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TABS = [
  { label: 'Favorites', status: 'favorite', icon: <FavoriteIcon fontSize="small" />, color: 'error' },
  { label: 'Owned',     status: 'owned',    icon: <CheckCircleIcon fontSize="small" />, color: 'success' },
  { label: 'Wanted',    status: 'wanted',   icon: <StarIcon fontSize="small" />, color: 'warning' },
];

export default function Favorites() {
  const { collection } = useAuth();
  const [allAmiibos, setAllAmiibos] = useState([]);
  const [loadingAmiibos, setLoadingAmiibos] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    amiiboApi
      .getAll()
      .then(setAllAmiibos)
      .catch(() => setError('Failed to load Amiibo data.'))
      .finally(() => setLoadingAmiibos(false));
  }, []);

  const currentStatus = TABS[tab].status;

  const filtered = useMemo(() => {
    const statusMatches = allAmiibos.filter((a) => {
      const amiiboId = `${a.head}${a.tail}`;
      return collection[amiiboId]?.[currentStatus];
    });
    if (!search) return statusMatches;
    const q = search.toLowerCase();
    return statusMatches.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.gameSeries.toLowerCase().includes(q)
    );
  }, [allAmiibos, collection, currentStatus, search]);

  // Count per tab
  const counts = useMemo(() => {
    const c = { favorite: 0, owned: 0, wanted: 0 };
    allAmiibos.forEach((a) => {
      const s = collection[`${a.head}${a.tail}`];
      if (s?.favorite) c.favorite++;
      if (s?.owned) c.owned++;
      if (s?.wanted) c.wanted++;
    });
    return c;
  }, [allAmiibos, collection]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        My Collection
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Your personal Amiibo library — favorites, owned, and wishlist.
      </Typography>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => { setTab(v); setSearch(''); }}
        sx={{ mb: 3 }}
      >
        {TABS.map((t, i) => (
          <Tab
            key={t.status}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {t.icon}
                {t.label}
                <Chip
                  label={counts[t.status]}
                  size="small"
                  color={counts[t.status] > 0 ? t.color : 'default'}
                  sx={{ height: 20, fontSize: 11, fontWeight: 700 }}
                />
              </Box>
            }
          />
        ))}
      </Tabs>

      {/* Search within collection */}
      <Box sx={{ mb: 3 }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={`Search your ${TABS[tab].label.toLowerCase()}…`}
        />
      </Box>

      <Divider sx={{ mb: 3 }} />

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loadingAmiibos ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nothing here yet
          </Typography>
          <Typography variant="body2" color="text.disabled">
            {search
              ? 'No matches for your search.'
              : `Browse the collection and mark Amiibos as ${TABS[tab].label.toLowerCase()}.`}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((amiibo) => (
            <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
              <AmiiboCard amiibo={amiibo} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}