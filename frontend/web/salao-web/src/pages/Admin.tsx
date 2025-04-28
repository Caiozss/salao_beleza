import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  Spa as SpaIcon,
  Inventory as InventoryIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Componente Dashboard
const Dashboard = () => {
  const [stats, setStats] = useState({
    agendamentosHoje: 0,
    clientesTotal: 0,
    produtosEstoqueBaixo: 0,
    lembretesHoje: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulação de carregamento de dados
        // Em uma implementação real, estes seriam chamadas à API
        setTimeout(() => {
          setStats({
            agendamentosHoje: 15,
            clientesTotal: 120,
            produtosEstoqueBaixo: 3,
            lembretesHoje: 5
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3} mt={1}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Agendamentos Hoje
              </Typography>
              <Typography variant="h4">
                {stats.agendamentosHoje}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" color="primary">
                Ver Detalhes
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total de Clientes
              </Typography>
              <Typography variant="h4">
                {stats.clientesTotal}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" color="primary">
                Ver Detalhes
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Produtos com Estoque Baixo
              </Typography>
              <Typography variant="h4">
                {stats.produtosEstoqueBaixo}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" color="primary">
                Ver Detalhes
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Lembretes para Hoje
              </Typography>
              <Typography variant="h4">
                {stats.lembretesHoje}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" color="primary">
                Ver Detalhes
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" mt={4} mb={2}>
        Próximos Agendamentos
      </Typography>
      <Paper>
        <List>
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <CalendarIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText 
              primary="Maria Silva - Corte de Cabelo" 
              secondary="Hoje às 14:30 - Profissional: Ana"
            />
            <Button variant="outlined" size="small">
              Detalhes
            </Button>
          </ListItem>
          <Divider variant="inset" component="li" />
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <CalendarIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText 
              primary="João Santos - Barba" 
              secondary="Hoje às 15:00 - Profissional: Carlos"
            />
            <Button variant="outlined" size="small">
              Detalhes
            </Button>
          </ListItem>
          <Divider variant="inset" component="li" />
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <CalendarIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText 
              primary="Carla Oliveira - Manicure" 
              secondary="Hoje às 16:30 - Profissional: Patrícia"
            />
            <Button variant="outlined" size="small">
              Detalhes
            </Button>
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

// Componente principal do Admin
const Admin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  useEffect(() => {
    // Definir a tab ativa com base na URL
    const path = location.pathname;
    if (path.includes('/admin/clientes')) {
      setTabValue(1);
    } else if (path.includes('/admin/agendamentos')) {
      setTabValue(2);
    } else if (path.includes('/admin/servicos')) {
      setTabValue(3);
    } else if (path.includes('/admin/produtos')) {
      setTabValue(4);
    } else if (path.includes('/admin/lembretes')) {
      setTabValue(5);
    } else {
      setTabValue(0);
    }
  }, [location]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Navegar para a rota correspondente
    switch (newValue) {
      case 0:
        navigate('/admin');
        break;
      case 1:
        navigate('/admin/clientes');
        break;
      case 2:
        navigate('/admin/agendamentos');
        break;
      case 3:
        navigate('/admin/servicos');
        break;
      case 4:
        navigate('/admin/produtos');
        break;
      case 5:
        navigate('/admin/lembretes');
        break;
      default:
        navigate('/admin');
    }
  };

  return (
    <>
      <Header />
      <Container maxWidth="lg">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Painel Administrativo
          </Typography>
          <Typography variant="subtitle1" align="center" color="textSecondary" paragraph>
            Gerencie seu salão de beleza
          </Typography>
          
          <Paper elevation={3} sx={{ mt: 4 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="admin tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab icon={<DashboardIcon />} label="Dashboard" />
                <Tab icon={<PeopleIcon />} label="Clientes" />
                <Tab icon={<CalendarIcon />} label="Agendamentos" />
                <Tab icon={<SpaIcon />} label="Serviços" />
                <Tab icon={<InventoryIcon />} label="Produtos" />
                <Tab icon={<NotificationsIcon />} label="Lembretes" />
              </Tabs>
            </Box>
            
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clientes" element={<Typography>Gerenciamento de Clientes</Typography>} />
              <Route path="/agendamentos" element={<Typography>Gerenciamento de Agendamentos</Typography>} />
              <Route path="/servicos" element={<Typography>Gerenciamento de Serviços</Typography>} />
              <Route path="/produtos" element={<Typography>Gerenciamento de Produtos</Typography>} />
              <Route path="/lembretes" element={<Typography>Gerenciamento de Lembretes</Typography>} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </Paper>
        </Box>
      </Container>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <Alert 
          onClose={() => setSnackbar({...snackbar, open: false})} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      <Footer />
    </>
  );
};

export default Admin;
