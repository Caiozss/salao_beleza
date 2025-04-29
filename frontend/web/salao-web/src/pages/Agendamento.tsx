import React, { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Paper, Grid, MenuItem, Snackbar, Alert } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../services/api';

const Agendamento: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const servicoParam = searchParams.get('servico');

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [data, setData] = useState<Date | null>(null);
  const [categoria, setCategoria] = useState(servicoParam || '');
  const [servico, setServico] = useState('');
  const [profissional, setProfissional] = useState('');
  const [horario, setHorario] = useState('');
  
  const [categorias, setCategorias] = useState([
    { id: 'cabelo', nome: 'Cabelereiro' },
    { id: 'unhas', nome: 'Manicure e Pedicure' },
    { id: 'estetica', nome: 'Estética' },
    { id: 'trancas', nome: 'Tranças' },
    { id: 'cilios', nome: 'Alongamento de Cílios' },
    { id: 'sobrancelha', nome: 'Design de Sobrancelha' }
  ]);
  
  const [servicos, setServicos] = useState<any[]>([]);
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [horarios, setHorarios] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Função para carregar serviços quando a categoria for selecionada
  const carregarServicos = async (categoria: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/servicos/categoria/${categoria}`);
      setServicos(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar serviços. Tente novamente.',
        severity: 'error'
      });
    }
  };

  // Função para carregar profissionais quando o serviço for selecionado
  const carregarProfissionais = async (servicoId: string) => {
    try {
      setLoading(true);
      const servicoSelecionado = servicos.find(s => s._id === servicoId);
      if (servicoSelecionado && servicoSelecionado.profissionaisHabilitados) {
        const profissionaisIds = servicoSelecionado.profissionaisHabilitados.map((p: any) => p._id);
        const response = await api.get('/profissionais');
        const todosProfissionais = response.data.data;
        const profissionaisFiltrados = todosProfissionais.filter((p: any) => 
          profissionaisIds.includes(p._id)
        );
        setProfissionais(profissionaisFiltrados);
      }
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar profissionais. Tente novamente.',
        severity: 'error'
      });
    }
  };

  // Função para carregar horários disponíveis
  const carregarHorarios = async () => {
    if (!data || !servico || !profissional) return;
    
    try {
      setLoading(true);
      const dataFormatada = data.toISOString().split('T')[0];
      const response = await api.post('/agendamentos/disponibilidade', {
        profissionalId: profissional,
        servicoId: servico,
        data: dataFormatada
      });
      
      setHorarios(response.data.disponibilidade);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar horários disponíveis. Tente novamente.',
        severity: 'error'
      });
    }
  };

  // Efeitos para carregar dados quando as seleções mudarem
  React.useEffect(() => {
    if (categoria) {
      carregarServicos(categoria);
    }
  }, [categoria]);

  React.useEffect(() => {
    if (servico) {
      carregarProfissionais(servico);
    }
  }, [servico]);

  React.useEffect(() => {
    if (data && servico && profissional) {
      carregarHorarios();
    }
  }, [data, servico, profissional]);

  // Função para enviar o agendamento
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome || !telefone || !data || !servico || !profissional || !horario) {
      setSnackbar({
        open: true,
        message: 'Por favor, preencha todos os campos obrigatórios.',
        severity: 'error'
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Primeiro, verificar se o cliente já existe ou criar um novo
      let clienteId;
      try {
        // Buscar cliente pelo telefone
        const clientesResponse = await api.get(`/clientes?telefone=${telefone}`);
        if (clientesResponse.data.data.length > 0) {
          clienteId = clientesResponse.data.data[0]._id;
        } else {
          // Criar novo cliente
          const novoCliente = await api.post('/clientes', {
            nome,
            telefone,
            email
          });
          clienteId = novoCliente.data.data._id;
        }
      } catch (error) {
        // Se der erro na busca, tenta criar um novo cliente
        const novoCliente = await api.post('/clientes', {
          nome,
          telefone,
          email
        });
        clienteId = novoCliente.data.data._id;
      }
      
      // Criar o agendamento
      const horarioSelecionado = horarios.find(h => h.formatado === horario);
      const dataHora = horarioSelecionado ? horarioSelecionado.hora : new Date();
      
      const agendamentoResponse = await api.post('/agendamentos', {
        cliente: clienteId,
        profissional,
        servico,
        dataHora,
        status: 'agendado'
      });
      
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Agendamento realizado com sucesso!',
        severity: 'success'
      });
      
      // Redirecionar para a página de confirmação após 2 segundos
      setTimeout(() => {
        navigate('/meus-agendamentos', { 
          state: { 
            agendamento: agendamentoResponse.data.data,
            telefone
          } 
        });
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao realizar agendamento:', error);
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Erro ao realizar agendamento. Tente novamente.',
        severity: 'error'
      });
    }
  };

  return (
    <>
      <Header />
      <Container maxWidth="md">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Agende seu Horário
          </Typography>
          <Typography variant="subtitle1" align="center" color="textSecondary" paragraph>
            Preencha o formulário abaixo para agendar seu atendimento
          </Typography>
          
          <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Seus Dados
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Nome Completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(XX) XXXXX-XXXX"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="E-mail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12} mt={2}>
                  <Typography variant="h6" gutterBottom>
                    Detalhes do Agendamento
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    required
                    fullWidth
                    label="Categoria"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                  >
                    {categorias.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.nome}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    required
                    fullWidth
                    label="Serviço"
                    value={servico}
                    onChange={(e) => setServico(e.target.value)}
                    disabled={!categoria || servicos.length === 0}
                  >
                    {servicos.map((serv) => (
                      <MenuItem key={serv._id} value={serv._id}>
                        {serv.nome} - R$ {serv.preco.toFixed(2)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    required
                    fullWidth
                    label="Profissional"
                    value={profissional}
                    onChange={(e) => setProfissional(e.target.value)}
                    disabled={!servico || profissionais.length === 0}
                  >
                    {profissionais.map((prof) => (
                      <MenuItem key={prof._id} value={prof._id}>
                        {prof.nome}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                    <DatePicker
                      label="Data"
                      value={data}
                      onChange={(newValue) => setData(newValue)}
                      disablePast
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    select
                    required
                    fullWidth
                    label="Horário"
                    value={horario}
                    onChange={(e) => setHorario(e.target.value)}
                    disabled={!data || !profissional || horarios.length === 0}
                  >
                    {horarios.map((hora) => (
                      <MenuItem key={hora.hora} value={hora.formatado}>
                        {hora.formatado}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                
                <Grid item xs={12} mt={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    disabled={loading}
                  >
                    {loading ? 'Processando...' : 'Confirmar Agendamento'}
                  </Button>
                </Grid>
              </Grid>
            </form>
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

export default Agendamento;
