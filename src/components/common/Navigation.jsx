import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Chip,
  Container
} from '@mui/material';
import {
  AccountCircle,
  Dashboard,
  Store,
  Logout,
  Login,
  PersonAdd
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Navigation = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isArtisan, logout } = useAuth();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleClose();
    navigate('/');
  };

  const isActivePath = (path) => location.pathname === path;

  return (
    <AppBar position="sticky" elevation={1}>
      <Container maxWidth="xl">
        <Toolbar sx={{ minHeight: 64 }}>
          {/* Logo */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              mr: 4
            }}
            onClick={() => navigate('/')}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: 'primary.main',
                letterSpacing: '-0.5px'
              }}
            >
              ArtisanAI
            </Typography>
            <Chip
              label="Beta"
              size="small"
              color="secondary"
              sx={{ ml: 1, fontSize: '0.625rem', height: 20 }}
            />
          </Box>

          {/* Navigation Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 4 }}>
            <Button
              color="inherit"
              startIcon={<Store />}
              onClick={() => navigate('/marketplace')}
              sx={{
                mr: 2,
                backgroundColor: isActivePath('/marketplace') ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                color: isActivePath('/marketplace') ? 'primary.main' : 'text.primary'
              }}
            >
              Marketplace
            </Button>
            
            {isArtisan && (
              <Button
                color="inherit"
                startIcon={<Dashboard />}
                onClick={() => navigate('/dashboard')}
                sx={{
                  mr: 2,
                  backgroundColor: isActivePath('/dashboard') ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                  color: isActivePath('/dashboard') ? 'primary.main' : 'text.primary'
                }}
              >
                Dashboard
              </Button>
            )}
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* User Actions */}
          {currentUser ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {!isArtisan && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/become-artisan')}
                  sx={{ mr: 2 }}
                >
                  Become an Artisan
                </Button>
              )}
              
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                {currentUser.photoURL ? (
                  <Avatar
                    src={currentUser.photoURL}
                    alt={currentUser.displayName}
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0)}
                  </Avatar>
                )}
              </IconButton>
              
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <Box sx={{ px: 2, py: 1, borderBottom: '1px solid #e0e0e0' }}>
                  <Typography variant="body2" color="text.secondary">
                    Signed in as
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {currentUser.displayName || currentUser.email}
                  </Typography>
                  {isArtisan && (
                    <Chip label="Artisan" size="small" color="primary" sx={{ mt: 0.5 }} />
                  )}
                </Box>
                
                {isArtisan && (
                  <MenuItem onClick={() => { navigate('/dashboard'); handleClose(); }}>
                    <Dashboard sx={{ mr: 1 }} fontSize="small" />
                    Dashboard
                  </MenuItem>
                )}
                
                <MenuItem onClick={() => { navigate('/marketplace'); handleClose(); }}>
                  <Store sx={{ mr: 1 }} fontSize="small" />
                  Marketplace
                </MenuItem>
                
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1 }} fontSize="small" />
                  Sign Out
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                startIcon={<Login />}
                onClick={() => navigate('/login')}
                sx={{ color: 'text.primary' }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => navigate('/signup')}
                disableElevation
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navigation;
