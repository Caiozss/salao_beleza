const express = require('express');
const router = express.Router();
const {
  getClientes,
  getCliente,
  createCliente,
  updateCliente,
  deleteCliente,
  getClientesInativos
} = require('../controllers/clienteController');

// Rotas básicas
router.route('/')
  .get(getClientes)
  .post(createCliente);

router.route('/:id')
  .get(getCliente)
  .put(updateCliente)
  .delete(deleteCliente);

// Rota para clientes inativos
router.route('/inativos/:dias')
  .get(getClientesInativos);

module.exports = router;
