const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const { Produto } = require('../../database/models');

// @desc    Obter todos os produtos
// @route   GET /api/v1/produtos
// @access  Private
exports.getProdutos = asyncHandler(async (req, res, next) => {
  const produtos = await Produto.find().sort({ categoria: 1, nome: 1 });
  
  res.status(200).json({
    success: true,
    count: produtos.length,
    data: produtos
  });
});

// @desc    Obter um produto específico
// @route   GET /api/v1/produtos/:id
// @access  Private
exports.getProduto = asyncHandler(async (req, res, next) => {
  const produto = await Produto.findById(req.params.id);
  
  if (!produto) {
    return next(new ErrorResponse(`Produto não encontrado com o ID ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: produto
  });
});

// @desc    Criar um novo produto
// @route   POST /api/v1/produtos
// @access  Private
exports.createProduto = asyncHandler(async (req, res, next) => {
  const produto = await Produto.create(req.body);
  
  res.status(201).json({
    success: true,
    data: produto
  });
});

// @desc    Atualizar um produto
// @route   PUT /api/v1/produtos/:id
// @access  Private
exports.updateProduto = asyncHandler(async (req, res, next) => {
  let produto = await Produto.findById(req.params.id);
  
  if (!produto) {
    return next(new ErrorResponse(`Produto não encontrado com o ID ${req.params.id}`, 404));
  }
  
  produto = await Produto.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: produto
  });
});

// @desc    Excluir um produto
// @route   DELETE /api/v1/produtos/:id
// @access  Private
exports.deleteProduto = asyncHandler(async (req, res, next) => {
  const produto = await Produto.findById(req.params.id);
  
  if (!produto) {
    return next(new ErrorResponse(`Produto não encontrado com o ID ${req.params.id}`, 404));
  }
  
  // Marcar como inativo em vez de excluir
  produto.ativo = false;
  await produto.save();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Atualizar estoque de um produto
// @route   PUT /api/v1/produtos/:id/estoque
// @access  Private
exports.atualizarEstoque = asyncHandler(async (req, res, next) => {
  const { quantidade, tipo, motivo, agendamento, responsavel } = req.body;
  
  const produto = await Produto.findById(req.params.id);
  
  if (!produto) {
    return next(new ErrorResponse(`Produto não encontrado com o ID ${req.params.id}`, 404));
  }
  
  await produto.atualizarEstoque(quantidade, tipo, motivo, agendamento, responsavel);
  
  res.status(200).json({
    success: true,
    data: produto
  });
});

// @desc    Obter produtos com estoque baixo
// @route   GET /api/v1/produtos/estoque-baixo
// @access  Private
exports.getProdutosEstoqueBaixo = asyncHandler(async (req, res, next) => {
  const produtos = await Produto.find({
    $expr: {
      $lte: ['$quantidadeEstoque', '$nivelMinimoEstoque']
    },
    ativo: true
  }).sort({ quantidadeEstoque: 1 });
  
  res.status(200).json({
    success: true,
    count: produtos.length,
    data: produtos
  });
});

// @desc    Obter produtos por categoria
// @route   GET /api/v1/produtos/categoria/:categoria
// @access  Private
exports.getProdutosPorCategoria = asyncHandler(async (req, res, next) => {
  const categoria = req.params.categoria;
  
  const produtos = await Produto.find({
    categoria: categoria,
    ativo: true
  }).sort({ nome: 1 });
  
  res.status(200).json({
    success: true,
    count: produtos.length,
    data: produtos
  });
});
