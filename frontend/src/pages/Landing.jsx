import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Container, Typography, Grid2 as Grid, Alert, Select, MenuItem,
  FormControl, InputLabel, Pagination, Divider,
} from '@mui/material';
import AmiiboCard, { AmiiboCardSkeleton } from '../components/AmiiboCard';
import SearchBar from '../components/SearchBar';
import CategoryChips from '../components/CategoryChips';
import { amiiboApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PAGE_SIZE = 24;

export default function Landing() {
  const { user } = useAuth();
  const [amiibos, setAmiibos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [page, setPage] = useState(1);

  useEffect(() => {
    amiiboApi
      .getAll()
      .then(setAmiibos)
      .catch(() => setError('Failed to load Amiibos. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  // Unique game series list
  const seriesList = useMemo(
    () => [...new Set(amiibos.map((a) => a.gameSeries))].sort(),
    [amiibos]
  );

  // Filter + sort
  const filtered = useMemo(() => {
    let list = amiibos;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.gameSeries.toLowerCase().includes(q) ||
          a.amiiboSeries.toLowerCase().includes(q)
      );
    }
    if (selectedSeries) {
      list = list.filter((a) => a.gameSeries === selectedSeries);
    }
    if (sortBy === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'series') list = [...list].sort((a, b) => a.amiiboSeries.localeCompare(b.amiiboSeries));
    return list;
  }, [amiibos, search, selectedSeries, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val) => { setSearch(val); setPage(1); };
  const handleSeries = (val) => { setSelectedSeries(val); setPage(1); };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight={900} gutterBottom>
          Amiibo Collection
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Browse {amiibos.length} Amiibos — track what you own, love, or want
        </Typography>
        <SearchBar value={search} onChange={handleSearch} />
      </Box>

      {/* Categories (logged-in only) */}
      {user && (
        <Box sx={{ mb: 3 }}>
          <CategoryChips
            categories={seriesList}
            selected={selectedSeries}
            onSelect={handleSeries}
            loading={loading}
          />
        </Box>
      )}

      {/* Toolbar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {loading ? 'Loading…' : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
        </Typography>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Sort by</InputLabel>
          <Select value={sortBy} label="Sort by" onChange={(e) => setSortBy(e.target.value)}>
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="series">Series</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Grid */}
      <Grid container spacing={2}>
        {loading
          ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <Grid key={i} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                <AmiiboCardSkeleton />
              </Grid>
            ))
          : paginated.map((amiibo) => (
              <Grid key={`${amiibo.head}-${amiibo.tail}`} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                <AmiiboCard amiibo={amiibo} />
              </Grid>
            ))}
      </Grid>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Container>
  );
}