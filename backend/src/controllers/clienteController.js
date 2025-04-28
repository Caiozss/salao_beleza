const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const { Cliente } = require('../../database/models');

// @desc    Obter todos os clientes
// @route   GET /api/v1/clientes
// @access  Private
exports.getClientes = asyncHandler(async (req, res, next) => {
  const clientes = await Cliente.find().sort({ nome: 1 });
  
  res.status(200).json({
    success: true,
    count: clientes.length,
    data: clientes
  });
});

// @desc    Obter um cliente específico
// @route   GET /api/v1/clientes/:id
// @access  Private
exports.getCliente = asyncHandler(async (req, res, next) => {
  const cliente = await Cliente.findById(req.params.id);
  
  if (!cliente) {
    return next(new ErrorResponse(`Cliente não encontrado com o ID ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: cliente
  });
});

// @desc    Criar um novo cliente
// @route   POST /api/v1/clientes
// @access  Private
exports.createCliente = asyncHandler(async (req, res, next) => {
  const cliente = await Cliente.create(req.body);
  
  res.status(201).json({
    success: true,
    data: cliente
  });
});

// @desc    Atualizar um cliente
// @route   PUT /api/v1/clientes/:id
// @access  Private
exports.updateCliente = asyncHandler(async (req, res, next) => {
  let cliente = await Cliente.findById(req.params.id);
  
  if (!cliente) {
    return next(new ErrorResponse(`Cliente não encontrado com o ID ${req.params.id}`, 404));
  }
  
  cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: cliente
  });
});

// @desc    Excluir um cliente
// @route   DELETE /api/v1/clientes/:id
// @access  Private
exports.deleteCliente = asyncHandler(async (req, res, next) => {
  const cliente = await Cliente.findById(req.params.id);
  
  if (!cliente) {
    return next(new ErrorResponse(`Cliente não encontrado com o ID ${req.params.id}`, 404));
  }
  
  await cliente.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Obter clientes inativos (sem visita há mais de X dias)
// @route   GET /api/v1/clientes/inativos/:dias
// @access  Private
exports.getClientesInativos = asyncHandler(async (req, res, next) => {
  const diasInatividade = parseInt(req.params.dias) || 30;
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - diasInatividade);
  
  const clientesInativos = await Cliente.find({
    $or: [
      { ultimaVisita: { $lt: dataLimite } },
      { ultimaVisita: { $exists: false } }
    ],
    ativo: true
  }).sort({ ultimaVisita: 1 });
  
  res.status(200).json({
    success: true,
    count: clientesInativos.length,
    data: clientesInativos
  });
});
