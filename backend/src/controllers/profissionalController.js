const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const { Profissional } = require('../../database/models');

// @desc    Obter todos os profissionais
// @route   GET /api/v1/profissionais
// @access  Private
exports.getProfissionais = asyncHandler(async (req, res, next) => {
  const profissionais = await Profissional.find().sort({ nome: 1 });
  
  res.status(200).json({
    success: true,
    count: profissionais.length,
    data: profissionais
  });
});

// @desc    Obter um profissional específico
// @route   GET /api/v1/profissionais/:id
// @access  Private
exports.getProfissional = asyncHandler(async (req, res, next) => {
  const profissional = await Profissional.findById(req.params.id);
  
  if (!profissional) {
    return next(new ErrorResponse(`Profissional não encontrado com o ID ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: profissional
  });
});

// @desc    Criar um novo profissional
// @route   POST /api/v1/profissionais
// @access  Private
exports.createProfissional = asyncHandler(async (req, res, next) => {
  const profissional = await Profissional.create(req.body);
  
  res.status(201).json({
    success: true,
    data: profissional
  });
});

// @desc    Atualizar um profissional
// @route   PUT /api/v1/profissionais/:id
// @access  Private
exports.updateProfissional = asyncHandler(async (req, res, next) => {
  let profissional = await Profissional.findById(req.params.id);
  
  if (!profissional) {
    return next(new ErrorResponse(`Profissional não encontrado com o ID ${req.params.id}`, 404));
  }
  
  profissional = await Profissional.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: profissional
  });
});

// @desc    Excluir um profissional
// @route   DELETE /api/v1/profissionais/:id
// @access  Private
exports.deleteProfissional = asyncHandler(async (req, res, next) => {
  const profissional = await Profissional.findById(req.params.id);
  
  if (!profissional) {
    return next(new ErrorResponse(`Profissional não encontrado com o ID ${req.params.id}`, 404));
  }
  
  await profissional.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Obter profissionais por especialidade
// @route   GET /api/v1/profissionais/especialidade/:especialidade
// @access  Private
exports.getProfissionaisPorEspecialidade = asyncHandler(async (req, res, next) => {
  const especialidade = req.params.especialidade;
  
  const profissionais = await Profissional.find({
    especialidades: especialidade,
    ativo: true
  }).sort({ nome: 1 });
  
  res.status(200).json({
    success: true,
    count: profissionais.length,
    data: profissionais
  });
});
