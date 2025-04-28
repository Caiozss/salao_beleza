const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const { Servico } = require('../../database/models');

// @desc    Obter todos os serviços
// @route   GET /api/v1/servicos
// @access  Public
exports.getServicos = asyncHandler(async (req, res, next) => {
  const servicos = await Servico.find({ ativo: true })
    .populate('profissionaisHabilitados', 'nome')
    .sort({ categoria: 1, nome: 1 });
  
  res.status(200).json({
    success: true,
    count: servicos.length,
    data: servicos
  });
});

// @desc    Obter um serviço específico
// @route   GET /api/v1/servicos/:id
// @access  Public
exports.getServico = asyncHandler(async (req, res, next) => {
  const servico = await Servico.findById(req.params.id)
    .populate('profissionaisHabilitados', 'nome')
    .populate('produtosUtilizados.produto', 'nome quantidadeEstoque');
  
  if (!servico) {
    return next(new ErrorResponse(`Serviço não encontrado com o ID ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: servico
  });
});

// @desc    Criar um novo serviço
// @route   POST /api/v1/servicos
// @access  Private
exports.createServico = asyncHandler(async (req, res, next) => {
  const servico = await Servico.create(req.body);
  
  res.status(201).json({
    success: true,
    data: servico
  });
});

// @desc    Atualizar um serviço
// @route   PUT /api/v1/servicos/:id
// @access  Private
exports.updateServico = asyncHandler(async (req, res, next) => {
  let servico = await Servico.findById(req.params.id);
  
  if (!servico) {
    return next(new ErrorResponse(`Serviço não encontrado com o ID ${req.params.id}`, 404));
  }
  
  servico = await Servico.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: servico
  });
});

// @desc    Excluir um serviço
// @route   DELETE /api/v1/servicos/:id
// @access  Private
exports.deleteServico = asyncHandler(async (req, res, next) => {
  const servico = await Servico.findById(req.params.id);
  
  if (!servico) {
    return next(new ErrorResponse(`Serviço não encontrado com o ID ${req.params.id}`, 404));
  }
  
  // Marcar como inativo em vez de excluir
  servico.ativo = false;
  await servico.save();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Obter serviços por categoria
// @route   GET /api/v1/servicos/categoria/:categoria
// @access  Public
exports.getServicosPorCategoria = asyncHandler(async (req, res, next) => {
  const categoria = req.params.categoria;
  
  const servicos = await Servico.find({
    categoria: categoria,
    ativo: true
  })
    .populate('profissionaisHabilitados', 'nome')
    .sort({ nome: 1 });
  
  res.status(200).json({
    success: true,
    count: servicos.length,
    data: servicos
  });
});

// @desc    Obter serviços por profissional
// @route   GET /api/v1/servicos/profissional/:id
// @access  Public
exports.getServicosPorProfissional = asyncHandler(async (req, res, next) => {
  const profissionalId = req.params.id;
  
  const servicos = await Servico.find({
    profissionaisHabilitados: profissionalId,
    ativo: true
  }).sort({ categoria: 1, nome: 1 });
  
  res.status(200).json({
    success: true,
    count: servicos.length,
    data: servicos
  });
});
