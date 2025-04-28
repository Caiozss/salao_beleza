const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/error');
const agendadorService = require('./services/agendadorService');

// Importar rotas
const clienteRoutes = require('./routes/clienteRoutes');
const profissionalRoutes = require('./routes/profissionalRoutes');
const servicoRoutes = require('./routes/servicoRoutes');
const agendamentoRoutes = require('./routes/agendamentoRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const lembreteRoutes = require('./routes/lembreteRoutes');
const notificacaoRoutes = require('./routes/notificacaoRoutes');

// Carregar variáveis de ambiente
dotenv.config();

// Conectar ao banco de dados
connectDB();

// Inicializar o app Express
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Montar rotas
app.use('/api/v1/clientes', clienteRoutes);
app.use('/api/v1/profissionais', profissionalRoutes);
app.use('/api/v1/servicos', servicoRoutes);
app.use('/api/v1/agendamentos', agendamentoRoutes);
app.use('/api/v1/produtos', produtoRoutes);
app.use('/api/v1/lembretes', lembreteRoutes);
app.use('/api/v1/notificacoes', notificacaoRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API do Salão de Beleza funcionando!' });
});

// Middleware de tratamento de erros
app.use(errorHandler);

// Definir porta
const PORT = process.env.PORT || 5000;

// Iniciar o servidor
const server = app.listen(PORT, () => {
  console.log(`Servidor rodando no modo ${process.env.NODE_ENV} na porta ${PORT}`);
  
  // Iniciar agendador de tarefas
  agendadorService.iniciarAgendador();
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.log(`Erro: ${err.message}`);
  // Fechar servidor e sair do processo
  server.close(() => process.exit(1));
});

module.exports = server;
