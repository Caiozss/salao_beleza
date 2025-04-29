const express = require('express');
const router = express.Router();
const {
  getLembretes,
  getLembrete,
  createLembrete,
  updateLembrete,
  deleteLembrete,
  concluirLembrete,
  getLembretesPorTipo,
  getLembretesHoje,
  getLembretesAtrasados
} = require('../controllers/lembreteController');

// Rotas básicas
router.route('/')
  .get(getLembretes)
  .post(createLembrete);

router.route('/:id')
  .get(getLembrete)
  .put(updateLembrete)
  .delete(deleteLembrete);

// Rota para concluir lembrete
router.route('/:id/concluir')
  .put(concluirLembrete);

// Rota para lembretes por tipo
router.route('/tipo/:tipo')
  .get(getLembretesPorTipo);

// Rota para lembretes de hoje
router.route('/hoje')
  .get(getLembretesHoje);

// Rota para lembretes atrasados
router.route('/atrasados')
  .get(getLembretesAtrasados);

module.exports = router;
