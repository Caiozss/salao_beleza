import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Grid, Button, TextField, Tabs, Tab, CircularProgress, Snackbar, Alert } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
      id={`agendamentos-tabpanel-${index}`}
      aria-labelledby={`agendamentos-tab-${index}`}
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

const MeusAgendamentos: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [telefone, setTelefone] = useState(location.state?.telefone || '');
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [buscaRealizada, setBuscaRealizada] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Efeito para carregar agendamentos se vier da página de agendamento
  useEffect(() => {
    if (location.state?.telefone) {
      buscarAgendamentos();
    }
  }, [location.state]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const buscarAgendamentos = async () => {
    if (!telefone) {
      setSnackbar({
        open: true,
        message: 'Por favor, informe seu telefone para buscar os agendamentos.',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      
      // Buscar cliente pelo telefone
      const clientesResponse = await api.get(`/clientes?telefone=${telefone}`);
      
      if (clientesResponse.data.data.length === 0) {
        setLoading(false);
        setBuscaRealizada(true);
        setAgendamentos([]);
        setSnackbar({
          open: true,
          message: 'Nenhum cliente encontrado com este telefone.',
          severity: 'error'
        });
        return;
      }
      
      const clienteId = clientesResponse.data.data[0]._id;
      
      // Buscar agendamentos do cliente
      const agendamentosResponse = await api.get(`/agendamentos/cliente/${clienteId}`);
      setAgendamentos(agendamentosResponse.data.data);
      
      setLoading(false);
      setBuscaRealizada(true);
      
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      setLoading(false);
      setBuscaRealizada(true);
      setSnackbar({
        open: true,
        message: 'Erro ao buscar agendamentos. Tente novamente.',
        severity: 'error'
      });
    }
  };

  const cancelarAgendamento = async (id: string) => {
    try {
      setLoading(true);
      await api.delete(`/agendamentos/${id}`);
      
      // Atualizar a lista de agendamentos
      const agendamentosAtualizados = agendamentos.map(agendamento => {
        if (agendamento._id === id) {
          return { ...agendamento, status: 'cancelado' };
        }
        return agendamento;
      });
      
      setAgendamentos(agendamentosAtualizados);
      setLoading(false);
      
      setSnackbar({
        open: true,
        message: 'Agendamento cancelado com sucesso!',
        severity: 'success'
      });
      
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Erro ao cancelar agendamento. Tente novamente.',
        severity: 'error'
      });
    }
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return format(data, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'agendado':
        return 'Agendado';
      case 'confirmado':
        return 'Confirmado';
      case 'concluido':
        return 'Concluído';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado':
        return '#f39c12'; // Amarelo
      case 'confirmado':
        return '#2ecc71'; // Verde
      case 'concluido':
        return '#3498db'; // Azul
      case 'cancelado':
        return '#e74c3c'; // Vermelho
      default:
        return '#7f8c8d'; // Cinza
    }
  };

  const filtrarAgendamentosPorStatus = (status: string[]) => {
    return agendamentos.filter(agendamento => status.includes(agendamento.status));
  };

  const agendamentosAtivos = filtrarAgendamentosPorStatus(['agendado', 'confirmado']);
  const agendamentosAnteriores = filtrarAgendamentosPorStatus(['concluido', 'cancelado']);

  return (
    <>
      <Header />
      <Container maxWidth="md">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Meus Agendamentos
          </Typography>
          <Typography variant="subtitle1" align="center" color="textSecondary" paragraph>
            Consulte e gerencie seus agendamentos
          </Typography>
          
          <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
            {!buscaRealizada && (
              <Box mb={4}>
                <Typography variant="h6" gutterBottom>
                  Informe seu telefone para buscar seus agendamentos
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      fullWidth
                      label="Telefone"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      placeholder="(XX) XXXXX-XXXX"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={buscarAgendamentos}
                      disabled={loading}
                      sx={{ height: '100%' }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Buscar'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {buscaRealizada && (
              <>
                {loading ? (
                  <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    {agendamentos.length === 0 ? (
                      <Box textAlign="center" my={4}>
                        <Typography variant="h6">
                          Nenhum agendamento encontrado.
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          sx={{ mt: 2 }}
                          onClick={() => navigate('/agendamento')}
                        >
                          Fazer um Agendamento
                        </Button>
                      </Box>
                    ) : (
                      <>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                          <Tabs value={tabValue} onChange={handleTabChange} aria-label="agendamentos tabs">
                            <Tab label={`Agendamentos Ativos (${agendamentosAtivos.length})`} />
                            <Tab label={`Histórico (${agendamentosAnteriores.length})`} />
                          </Tabs>
                        </Box>
                        
                        <TabPanel value={tabValue} index={0}>
                          {agendamentosAtivos.length === 0 ? (
                            <Box textAlign="center" my={2}>
                              <Typography variant="body1">
                                Você não possui agendamentos ativos.
                              </Typography>
                              <Button
                                variant="contained"
                                color="primary"
                                sx={{ mt: 2 }}
                                onClick={() => navigate('/agendamento')}
                              >
                                Fazer um Agendamento
                              </Button>
                            </Box>
                          ) : (
                            <Grid container spacing={3}>
                              {agendamentosAtivos.map((agendamento) => (
                                <Grid item xs={12} key={agendamento._id}>
                                  <Paper elevation={2} sx={{ p: 3, position: 'relative' }}>
                                    <Box sx={{ 
                                      position: 'absolute', 
                                      top: 16, 
                                      right: 16, 
                                      backgroundColor: getStatusColor(agendamento.status),
                                      color: 'white',
                                      px: 2,
                                      py: 0.5,
                                      borderRadius: 1
                                    }}>
                                      {getStatusLabel(agendamento.status)}
                                    </Box>
                                    <Typography variant="h6" gutterBottom>
                                      {agendamento.servico.nome}
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                      <strong>Data e Hora:</strong> {formatarData(agendamento.dataHora)}
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                      <strong>Profissional:</strong> {agendamento.profissional.nome}
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                      <strong>Valor:</strong> R$ {agendamento.valorTotal.toFixed(2)}
                                    </Typography>
                                    
                                    <Box mt={2}>
                                      <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => cancelarAgendamento(agendamento._id)}
                                        disabled={loading}
                                      >
                                        Cancelar Agendamento
                                      </Button>
                                    </Box>
                                  </Paper>
                                </Grid>
                              ))}
                            </Grid>
                          )}
                        </TabPanel>
                        
                        <TabPanel value={tabValue} index={1}>
                          {agendamentosAnteriores.length === 0 ? (
                            <Box textAlign="center" my={2}>
                              <Typography variant="body1">
                                Você não possui histórico de agendamentos.
                              </Typography>
                            </Box>
                          ) : (
                            <Grid container spacing={3}>
                              {agendamentosAnteriores.map((agendamento) => (
                                <Grid item xs={12} key={agendamento._id}>
                                  <Paper elevation={2} sx={{ p: 3, position: 'relative' }}>
                                    <Box sx={{ 
                                      position: 'absolute', 
                                      top: 16, 
                                      right: 16, 
                                      backgroundColor: getStatusColor(agendamento.status),
                                      color: 'white',
                                      px: 2,
                                      py: 0.5,
                                      borderRadius: 1
                                    }}>
                                      {getStatusLabel(agendamento.status)}
                                    </Box>
                                    <Typography variant="h6" gutterBottom>
                                      {agendamento.servico.nome}
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                      <strong>Data e Hora:</strong> {formatarData(agendamento.dataHora)}
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                      <strong>Profissional:</strong> {agendamento.profissional.nome}
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                      <strong>Valor:</strong> R$ {agendamento.valorTotal.toFixed(2)}
                                    </Typography>
                                  </Paper>
                                </Grid>
                              ))}
                            </Grid>
                          )}
                        </TabPanel>
                      </>
                    )}
                  </>
                )}
                
                <Box mt={4} textAlign="center">
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      setBuscaRealizada(false);
                      setTelefone('');
                      setAgendamentos([]);
                    }}
                  >
                    Buscar Outro Telefone
                  </Button>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ ml: 2 }}
                    onClick={() => navigate('/agendamento')}
                  >
                    Novo Agendamento
                  </Button>
                </Box>
              </>
            )}
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

export default MeusAgendamentos;
