import React from 'react';
import { Box, Chip, Skeleton, Typography } from '@mui/material';

const POPULAR = [
  'Super Smash Bros.',
  'The Legend of Zelda',
  'Pokémon',
  'Super Mario',
  'Animal Crossing',
  'Splatoon',
  'Kirby',
  'Fire Emblem',
  'Metroid',
  'Xenoblade',
];

export default function CategoryChips({ categories = [], selected, onSelect, loading = false }) {
  const list = categories.length > 0 ? categories : POPULAR;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, pt: 0.5 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" width={100 + i * 10} height={32} sx={{ flexShrink: 0, borderRadius: 4 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
        SERIES
      </Typography>
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          pb: 1,
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { height: 4 },
          '&::-webkit-scrollbar-thumb': { borderRadius: 2, bgcolor: 'divider' },
        }}
      >
        <Chip
          label="All"
          clickable
          variant={selected === null ? 'filled' : 'outlined'}
          color={selected === null ? 'primary' : 'default'}
          onClick={() => onSelect(null)}
          sx={{ flexShrink: 0 }}
        />
        {list.map((cat) => (
          <Chip
            key={cat}
            label={cat}
            clickable
            variant={selected === cat ? 'filled' : 'outlined'}
            color={selected === cat ? 'primary' : 'default'}
            onClick={() => onSelect(cat === selected ? null : cat)}
            sx={{ flexShrink: 0 }}
          />
        ))}
      </Box>
    </Box>
  );
}
