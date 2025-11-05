import { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import logo from '../../../assets/logo.png';
import TextBoxSearch from './TextBoxSearch';
import MyDrawer from './MyDrawer';
import MyMenuBar from './MyMenuBar';

export default function Header() {
  const cartData = useSelector((state) => state.cart);
  const user = useSelector((state) => state.user);
  const userData = Object.values(user)[0];
  const cartCount = Object.keys(cartData || {}).length;

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [open, setOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          setShowHeader(currentScrollY <= lastScrollY || currentScrollY < 100);
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const headerHeight = isMobile ? 140 : 35 + 65 + 48;

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Scroll Text Bar */}
      <AppBar
        position="fixed"
        sx={{
          bgcolor: 'black',
          height: 35,
          top: showHeader ? 0 : '-35px',
          transition: 'top 0.4s ease-in-out',
          zIndex: 1302,
        }}
      >
        <Box
          sx={{
            whiteSpace: 'nowrap',
            animation: 'scroll-left 30s linear infinite',
            color: 'white',
            fontSize: '0.85rem',
            lineHeight: '35px',
            px: 2,
          }}
        >
          <span style={{ marginRight: 150 }}>🚚 FREE SHIPPING AND RETURNS</span>
          <span style={{ marginRight: 150 }}>🏆 2 YEARS OF WARRANTY</span>
          <span style={{ marginRight: 150 }}>📍 30 DAYS MONEYBACK GUARANTEE</span>
          <span style={{ marginRight: 150 }}>*Free Shipping*</span>
          <span style={{ marginRight: 150 }}>🏆 Buy 1 Glass Case, Get 2nd @ ₹299</span>
        </Box>
        <style>
          {`
            @keyframes scroll-left {
              0% { transform: translateX(100%); }
              100% { transform: translateX(-100%); }
            }
          `}
        </style>
      </AppBar>

      {/* Main Header */}
      <AppBar
        position="fixed"
        color="default"
        elevation={1}
        sx={{
          top: showHeader ? '35px' : '-100px',
          transition: 'top 0.4s ease-in-out',
          zIndex: 1301,
        }}
      >
        <Toolbar
          sx={{
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center',
            justifyContent: 'space-between',
            minHeight: isMobile ? 'auto' : 65,
            px: 1,
            py: isMobile ? 1 : 0,
            gap: isMobile ? 1 : 0,
          }}
        >
          {/* Top Row: Menu, Logo, Cart */}
          <Box
            sx={{
              display: 'flex',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Left: Drawer Icon or Spacer */}
            <Box sx={{ width: 48, display: 'flex', justifyContent: 'flex-start' }}>
              {isMobile && (
                <IconButton color="inherit" onClick={() => setOpen(true)}>
                  <MenuIcon />
                </IconButton>
              )}
            </Box>

            {/* Center: Logo */}
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                justifyContent: isMobile ? 'center' : 'flex-start',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/homepage')}
            >
              <img
                src={logo}
                alt="Zeptra logo"
                style={{
                  width: isMobile ? 40 : 50,
                  height: isMobile ? 40 : 50,
                  objectFit: 'contain',
                }}
              />
              {!isMobile && (
                <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 1 }}>
                  {/* Pintora */}
                </Typography>
              )}
            </Box>

            {/* Right: Cart + Account */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton color="inherit" onClick={() => navigate('/cartdisplaypage')}>
                <Badge badgeContent={cartCount || 0} color="secondary">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
              {!isMobile && (
                <IconButton onClick={() => navigate('/signin')} color="inherit">
                  <AccountCircleIcon />
                  <Typography sx={{ ml: 1, fontWeight: 'bold' }}>
                    {!userData ? 'Sign In' : userData.firstname}
                  </Typography>
                </IconButton>
              )}
            </Box>
          </Box>

          {/* Mobile Search */}
          {isMobile && (
            <Box sx={{ width: '100%' }}>
              <TextBoxSearch width="100%" />
            </Box>
          )}

          {/* Desktop Search Centered */}
          {!isMobile && (
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 500,
              }}
            >
              <TextBoxSearch width="100%" />
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Sticky Menu (Desktop Only) */}
      {!isMobile && (
        <AppBar
          position="fixed"
          sx={{
            top: showHeader ? '100px' : '0px',
            height: 48,
            zIndex: 1300,
            bgcolor: '#3f2b56',
            transition: 'top 0.4s ease-in-out',
          }}
        >
          <Toolbar sx={{ minHeight: '48px', justifyContent: 'center' }}>
            <MyMenuBar />
          </Toolbar>
        </AppBar>
      )}

      {/* Drawer (Mobile Side Menu) */}
      <MyDrawer open={open} setOpen={setOpen} />

      {/* Padding to push content below fixed header */}
      <Box sx={{ pt: `${headerHeight}px` }} />
    </Box>
  );
}
