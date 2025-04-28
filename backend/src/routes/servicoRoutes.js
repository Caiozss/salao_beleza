const express = require('express');
const router = express.Router();
const {
  getServicos,
  getServico,
  createServico,
  updateServico,
  deleteServico,
  getServicosPorCategoria,
  getServicosPorProfissional
} = require('../controllers/servicoController');

// Rotas básicas
router.route('/')
  .get(getServicos)
  .post(createServico);

router.route('/:id')
  .get(getServico)
  .put(updateServico)
  .delete(deleteServico);

// Rota para serviços por categoria
router.route('/categoria/:categoria')
  .get(getServicosPorCategoria);

// Rota para serviços por profissional
router.route('/profissional/:id')
  .get(getServicosPorProfissional);

module.exports = router;
