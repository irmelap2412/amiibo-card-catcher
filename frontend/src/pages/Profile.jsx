import React, { useState } from 'react';
import {
  Box, Container, Typography, Paper, TextField, Button,
  Alert, Grid2 as Grid, Avatar, InputAdornment, IconButton,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import { useAuth } from '../context/AuthContext';

function StatCard({ icon, label, value, color }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, textAlign: 'center' }}>
      <Box sx={{ color: `${color}.main`, mb: 0.5 }}>{icon}</Box>
      <Typography variant="h4" fontWeight={800}>{value}</Typography>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
    </Paper>
  );
}

export default function Profile() {
  const { user, collection, updateProfile, updatePassword } = useAuth();
  const [profileForm, setProfileForm] = useState({ username: user?.name || user?.username || '', email: user?.email || '' });
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);
  const [pwMsg, setPwMsg] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPw, setLoadingPw] = useState(false);

  const stats = Object.values(collection).reduce(
    (acc, s) => {
      if (s.favorite) acc.favorite++;
      if (s.owned) acc.owned++;
      if (s.wanted) acc.wanted++;
      return acc;
    },
    { favorite: 0, owned: 0, wanted: 0 }
  );

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    setLoadingProfile(true);
    try {
      await updateProfile(profileForm);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err?.response?.data?.message || 'Update failed.' });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) { setPwMsg({ type: 'error', text: 'Passwords do not match.' }); return; }
    if (pwForm.newPw.length < 8) { setPwMsg({ type: 'error', text: 'Minimum 8 characters.' }); return; }
    setPwMsg(null);
    setLoadingPw(true);
    try {
      await updatePassword({ currentPassword: pwForm.current, newPassword: pwForm.newPw });
      setPwMsg({ type: 'success', text: 'Password changed successfully.' });
      setPwForm({ current: '', newPw: '', confirm: '' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err?.response?.data?.message || 'Password change failed.' });
    } finally {
      setLoadingPw(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 28, fontWeight: 700 }}>
          {user?.email?.[0]?.toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight={800}>{user?.name || user?.username || 'Your Account'}</Typography>
          <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
        </Box>
      </Box>

      <Typography variant="overline" color="text.secondary" fontWeight={700}>Collection Stats</Typography>
      <Grid container spacing={2} sx={{ mt: 0.5, mb: 4 }}>
        <Grid size={{ xs: 4 }}>
          <StatCard icon={<FavoriteIcon />} label="Favorites" value={stats.favorite} color="error" />
        </Grid>
        <Grid size={{ xs: 4 }}>
          <StatCard icon={<CheckCircleIcon />} label="Owned" value={stats.owned} color="success" />
        </Grid>
        <Grid size={{ xs: 4 }}>
          <StatCard icon={<StarIcon />} label="Wanted" value={stats.wanted} color="warning" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Profile</Typography>
            {profileMsg && <Alert severity={profileMsg.type} sx={{ mb: 2 }}>{profileMsg.text}</Alert>}
            <Box component="form" onSubmit={handleProfileSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Username" value={profileForm.username} size="small"
                onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })} />
              <TextField label="Email" type="email" value={profileForm.email} size="small"
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
              <Button type="submit" variant="contained" disableElevation disabled={loadingProfile}>
                {loadingProfile ? 'Saving…' : 'Save Changes'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Change Password</Typography>
            {pwMsg && <Alert severity={pwMsg.type} sx={{ mb: 2 }}>{pwMsg.text}</Alert>}
            <Box component="form" onSubmit={handlePwSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Current Password" type={showPw ? 'text' : 'password'} value={pwForm.current}
                size="small" required
                onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                InputProps={{ endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPw(!showPw)} edge="end" size="small">
                      {showPw ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )}}
              />
              <TextField label="New Password" type={showPw ? 'text' : 'password'} value={pwForm.newPw}
                size="small" required helperText="Minimum 8 characters"
                onChange={(e) => setPwForm({ ...pwForm, newPw: e.target.value })} />
              <TextField label="Confirm New Password" type={showPw ? 'text' : 'password'} value={pwForm.confirm}
                size="small" required
                onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
              <Button type="submit" variant="contained" color="error" disableElevation disabled={loadingPw}>
                {loadingPw ? 'Updating…' : 'Update Password'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}