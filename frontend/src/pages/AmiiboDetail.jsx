import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Box, Container, Grid, Typography, Chip, Skeleton, Alert,
  Divider, Paper, Stack, IconButton, Tooltip, Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import GamesIcon from '@mui/icons-material/Games';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { amiiboApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

// ── Platform icon mapping ────────────────────────────────────────────────────
const PLATFORM_META = {
  gamesSwitch: { label: 'Nintendo Switch', icon: <GamesIcon fontSize="small" />, color: '#e60012' },
  games3DS:    { label: 'Nintendo 3DS',    icon: <PhoneIphoneIcon fontSize="small" />, color: '#cc2200' },
  gamesWiiU:   { label: 'Wii U',           icon: <SportsEsportsIcon fontSize="small" />, color: '#009ac7' },
};

// ── Helpers ──────────────────────────────────────────────────────────────────
/**
 * Flatten games from all platforms into a single list with platform metadata.
 * Returns: [{ gameName, platform, platformMeta, usage: [...] }, ...]
 */
function flattenGames(amiiboDetail) {
  if (!amiiboDetail) return [];
  const result = [];
  for (const [platformKey, meta] of Object.entries(PLATFORM_META)) {
    const games = amiiboDetail[platformKey] ?? [];
    for (const game of games) {
      result.push({
        gameName: game.gameName,
        platform: platformKey,
        platformMeta: meta,
        usage: game.amiiboUsage ?? [],
      });
    }
  }
  return result;
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Skeleton width={100} height={36} sx={{ mb: 3 }} />
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Skeleton variant="rectangular" height={340} sx={{ borderRadius: 3 }} />
          <Skeleton width="70%" height={32} sx={{ mt: 2 }} />
          <Skeleton width="50%" height={24} />
        </Grid>
        <Grid item xs={12} md={8}>
          <Skeleton width="40%" height={28} sx={{ mb: 2 }} />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} height={52} sx={{ mb: 1, borderRadius: 2 }} />
          ))}
        </Grid>
      </Grid>
    </Container>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AmiiboDetail() {
  const { slug } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, getAmiiboStatus, toggleStatus } = useAuth();

  const [baseAmiibo, setBaseAmiibo] = useState(state?.amiibo ?? null);
  const [detail, setDetail]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [imgError, setImgError]     = useState(false);

  // Extract tail from slug: "mario-00000002" → "00000002"
  const tail = useMemo(() => slug?.split('-').pop(), [slug]);

  // ── Fetch detail (games + usage) ─────────────────────────────────────────
  useEffect(() => {
    if (!tail) return;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        let base = baseAmiibo;

        if (!base) {
          const all = await amiiboApi.getAll();
          base = all.find(a => a.tail === tail);
          if (!base) throw new Error('Amiibo not found.');
          setBaseAmiibo(base);
        }

        const fetched = await amiiboApi.getDetail(base.head, base.tail);
        setDetail(fetched);
      } catch (err) {
        setError(err.message ?? 'Failed to load amiibo details.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [tail]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived data ─────────────────────────────────────────────────────────
  const games = useMemo(() => flattenGames(detail), [detail]);

  const activeGame = useMemo(
    () => games.find(g => g.gameName === selectedGame) ?? null,
    [games, selectedGame],
  );

  const status = useMemo(
    () => (baseAmiibo ? getAmiiboStatus(baseAmiibo) : { owned: false, favorite: false, wanted: false }),
    [baseAmiibo, getAmiiboStatus],
  );

  const handleToggle = (category) => (e) => {
    e.preventDefault();
    if (!user || !baseAmiibo) return;
    toggleStatus(baseAmiibo, category);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading && !baseAmiibo) return <DetailSkeleton />;

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button component={Link} to="/" startIcon={<ArrowBackIcon />}>Back to browse</Button>
      </Container>
    );
  }

  const amiibo = baseAmiibo;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Container maxWidth="lg" sx={{ py: 1.5 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ color: 'text.secondary', fontWeight: 500 }}
          >
            Back
          </Button>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pt: 4 }}>
        <Grid container spacing={4}>
          {/* ── LEFT: Image + meta ────────────────────────────────────── */}
          <Grid item xs={12} md={4} lg={3}>
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                position: 'sticky',
                top: 80,
              }}
            >
              <Box
                component="img"
                src={imgError ? '/placeholder-amiibo.png' : amiibo?.image}
                alt={amiibo?.name}
                onError={() => setImgError(true)}
                sx={{
                  width: '100%',
                  maxWidth: 220,
                  height: 220,
                  objectFit: 'contain',
                }}
              />

              <Box sx={{ width: '100%', textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={800} gutterBottom>
                  {amiibo?.name}
                </Typography>
                <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
                  <Chip label={amiibo?.amiiboSeries} size="small" variant="outlined" />
                  <Chip label={amiibo?.type} size="small" color="primary" variant="outlined" />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {amiibo?.gameSeries} series
                </Typography>
              </Box>

              <Divider sx={{ width: '100%' }} />

              {/* Status badges */}
              <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
                {status.owned    && <Chip label="Owned"    size="small" color="success" />}
                {status.favorite && <Chip label="Favorite" size="small" color="error" />}
                {status.wanted   && <Chip label="Wanted"   size="small" color="warning" />}
              </Stack>

              {/* Collection actions */}
              {user && (
                <Stack direction="row" spacing={0.5} justifyContent="center">
                  <Tooltip title={status.favorite ? 'Remove from Favorites' : 'Add to Favorites'}>
                    <IconButton size="small" onClick={handleToggle('favorite')} color={status.favorite ? 'error' : 'default'}>
                      {status.favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={status.owned ? 'Mark as Not Owned' : 'Mark as Owned'}>
                    <IconButton size="small" onClick={handleToggle('owned')} color={status.owned ? 'success' : 'default'}>
                      {status.owned ? <CheckCircleIcon /> : <CheckCircleOutlineIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={status.wanted ? 'Remove from Wishlist' : 'Add to Wishlist'}>
                    <IconButton size="small" onClick={handleToggle('wanted')} color={status.wanted ? 'warning' : 'default'}>
                      {status.wanted ? <StarIcon /> : <StarBorderIcon />}
                    </IconButton>
                  </Tooltip>
                </Stack>
              )}

              {/* Release dates */}
              {amiibo?.release && (
                <>
                  <Divider sx={{ width: '100%' }} />
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Release Dates
                    </Typography>
                    {Object.entries({
                      'North America': amiibo.release.na,
                      'Europe':        amiibo.release.eu,
                      'Japan':         amiibo.release.jp,
                      'Australia':     amiibo.release.au,
                    })
                      .filter(([, date]) => date)
                      .map(([region, date]) => (
                        <Box key={region} sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">{region}</Typography>
                          <Typography variant="caption" fontWeight={600}>{date}</Typography>
                        </Box>
                      ))}
                  </Box>
                </>
              )}
            </Paper>
          </Grid>

          {/* ── RIGHT: Games + usage ─────────────────────────────────── */}
          <Grid item xs={12} md={8} lg={9}>
            <Typography variant="h6" fontWeight={800} gutterBottom>
              Compatible Games
            </Typography>

            {loading ? (
              [...Array(4)].map((_, i) => (
                <Skeleton key={i} height={56} sx={{ mb: 1, borderRadius: 2 }} />
              ))
            ) : games.length === 0 ? (
              <Alert severity="info">No game compatibility data available for this amiibo.</Alert>
            ) : (
              <Grid container spacing={3}>
                {/* Games list */}
                <Grid item xs={12} sm={selectedGame ? 5 : 12} md={selectedGame ? 4 : 12}>
                  <Stack spacing={1}>
                    {games.map((game) => {
                      const isActive = selectedGame === game.gameName;
                      return (
                        <Paper
                          key={`${game.platform}-${game.gameName}`}
                          variant="outlined"
                          onClick={() => setSelectedGame(isActive ? null : game.gameName)}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            borderColor: isActive ? 'primary.main' : 'divider',
                            bgcolor: isActive ? 'primary.50' : 'background.paper',
                            transition: 'all 0.15s ease',
                            '&:hover': {
                              borderColor: 'primary.light',
                              bgcolor: isActive ? 'primary.50' : 'action.hover',
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: 32, height: 32,
                              borderRadius: 1.5,
                              bgcolor: game.platformMeta.color + '15',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: game.platformMeta.color,
                              flexShrink: 0,
                            }}
                          >
                            {game.platformMeta.icon}
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              fontWeight={isActive ? 700 : 500}
                              noWrap
                              title={game.gameName}
                              color={isActive ? 'primary.main' : 'text.primary'}
                            >
                              {game.gameName}
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                              {game.platformMeta.label}
                              {game.usage.length > 0 && ` · ${game.usage.length} use${game.usage.length > 1 ? 's' : ''}`}
                            </Typography>
                          </Box>
                          {isActive && (
                            <Chip label="Selected" size="small" color="primary" sx={{ ml: 'auto', flexShrink: 0 }} />
                          )}
                        </Paper>
                      );
                    })}
                  </Stack>
                </Grid>

                {/* Usage detail panel */}
                {activeGame && (
                  <Grid item xs={12} sm={7} md={8}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        position: 'sticky',
                        top: 80,
                        borderColor: 'primary.light',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" fontWeight={800}>
                            {activeGame.gameName}
                          </Typography>
                          <Chip
                            icon={activeGame.platformMeta.icon}
                            label={activeGame.platformMeta.label}
                            size="small"
                            variant="outlined"
                            sx={{ mt: 0.5, color: activeGame.platformMeta.color, borderColor: activeGame.platformMeta.color }}
                          />
                        </Box>
                        <IconButton size="small" onClick={() => setSelectedGame(null)} sx={{ color: 'text.disabled' }}>
                          ✕
                        </IconButton>
                      </Box>

                      <Divider sx={{ mb: 2 }} />

                      {activeGame.usage.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          No detailed usage information available for this game.
                        </Typography>
                      ) : (
                        <Stack spacing={1.5}>
                          {activeGame.usage.map((u, idx) => (
                            <Box
                              key={idx}
                              sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1.5,
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: 'action.hover',
                              }}
                            >
                              <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                                {u.Usage}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </Paper>
                  </Grid>
                )}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}