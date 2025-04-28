import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Menu, MenuItem, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleClose();
  };

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              mr: 2,
              fontWeight: 700,
              color: 'white',
              textDecoration: 'none',
              flexGrow: isMobile ? 1 : 0
            }}
          >
            Salão de Beleza
          </Typography>

          {isMobile ? (
            <>
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMenu}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={open}
                onClose={handleClose}
              >
                <MenuItem onClick={() => handleNavigation('/')}>Início</MenuItem>
                <MenuItem onClick={() => handleNavigation('/agendamento')}>Agendar</MenuItem>
                <MenuItem onClick={() => handleNavigation('/meus-agendamentos')}>Meus Agendamentos</MenuItem>
                <MenuItem onClick={() => handleNavigation('/login')}>Entrar</MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <Button color="inherit" component={Link} to="/">
                Início
              </Button>
              <Button color="inherit" component={Link} to="/agendamento">
                Agendar
              </Button>
              <Button color="inherit" component={Link} to="/meus-agendamentos">
                Meus Agendamentos
              </Button>
              <Button 
                color="inherit" 
                variant="outlined" 
                component={Link} 
                to="/login"
                sx={{ ml: 2, borderColor: 'white' }}
              >
                Entrar
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
