const express = require('express');
const router = express.Router();
const {
  getProdutos,
  getProduto,
  createProduto,
  updateProduto,
  deleteProduto,
  atualizarEstoque,
  getProdutosEstoqueBaixo,
  getProdutosPorCategoria
} = require('../controllers/produtoController');

// Rotas básicas
router.route('/')
  .get(getProdutos)
  .post(createProduto);

router.route('/:id')
  .get(getProduto)
  .put(updateProduto)
  .delete(deleteProduto);

// Rota para atualizar estoque
router.route('/:id/estoque')
  .put(atualizarEstoque);

// Rota para produtos com estoque baixo
router.route('/estoque-baixo')
  .get(getProdutosEstoqueBaixo);

// Rota para produtos por categoria
router.route('/categoria/:categoria')
  .get(getProdutosPorCategoria);

module.exports = router;
