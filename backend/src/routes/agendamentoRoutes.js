const express = require('express');
const router = express.Router();
const {
  getAgendamentos,
  getAgendamento,
  createAgendamento,
  updateAgendamento,
  deleteAgendamento,
  getAgendamentosPorData,
  getAgendamentosPorProfissional,
  getAgendamentosPorCliente,
  verificarDisponibilidade
} = require('../controllers/agendamentoController');

// Rotas básicas
router.route('/')
  .get(getAgendamentos)
  .post(createAgendamento);

router.route('/:id')
  .get(getAgendamento)
  .put(updateAgendamento)
  .delete(deleteAgendamento);

// Rota para verificar disponibilidade
router.route('/disponibilidade')
  .post(verificarDisponibilidade);

// Rota para agendamentos por data
router.route('/data/:data')
  .get(getAgendamentosPorData);

// Rota para agendamentos por profissional
router.route('/profissional/:id')
  .get(getAgendamentosPorProfissional);

// Rota para agendamentos por cliente
router.route('/cliente/:id')
  .get(getAgendamentosPorCliente);

module.exports = router;
