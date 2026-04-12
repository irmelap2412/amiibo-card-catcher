import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Avatar,
  Menu, MenuItem, Box, Divider, Tooltip,
} from '@mui/material';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar sx={{ gap: 1 }}>
        {/* Logo */}
        <Box
          onClick={() => navigate('/')}
          sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', flexGrow: 0, mr: 2 }}
        >
          <SportsEsportsIcon sx={{ fontSize: 28 }} />
          <Typography variant="h6" fontWeight={800} letterSpacing={-0.5}>
            AmiiboDB
          </Typography>
        </Box>

        {/* Nav links when logged in */}
        {user && (
          <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 1 }}>
            <Button
              size="small"
              onClick={() => navigate('/')}
              variant={isActive('/') ? 'contained' : 'text'}
              color={isActive('/') ? 'secondary' : 'inherit'}
              disableElevation
            >
              Browse
            </Button>
            <Button
              size="small"
              onClick={() => navigate('/favorites')}
              variant={isActive('/favorites') ? 'contained' : 'text'}
              color={isActive('/favorites') ? 'secondary' : 'inherit'}
              startIcon={<FavoriteIcon fontSize="small" />}
              disableElevation
            >
              My Collection
            </Button>
          </Box>
        )}

        {!user && <Box sx={{ flexGrow: 1 }} />}

        {/* Auth area */}
        {user ? (
          <>
            <Tooltip title={user.email}>
              <IconButton onClick={handleMenuOpen} size="small" sx={{ ml: 1 }}>
                <Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main', fontSize: 14, fontWeight: 700 }}>
                  {user.email?.[0]?.toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{ sx: { minWidth: 200, mt: 0.5 } }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={700}>{user.username || 'Account'}</Typography>
                <Typography variant="caption" color="text.secondary">{user.email}</Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                <AccountCircleIcon fontSize="small" sx={{ mr: 1.5 }} /> Profile
              </MenuItem>
              <MenuItem onClick={() => { navigate('/favorites'); handleMenuClose(); }}>
                <FavoriteIcon fontSize="small" sx={{ mr: 1.5 }} /> My Collection
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} /> Sign Out
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="text" color="inherit" onClick={() => navigate('/login')}>
              Log In
            </Button>
            <Button variant="contained" color="secondary" disableElevation onClick={() => navigate('/signup')}>
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
