const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const { Lembrete, Profissional, Cliente, Produto } = require('../../database/models');

// @desc    Obter todos os lembretes
// @route   GET /api/v1/lembretes
// @access  Private
exports.getLembretes = asyncHandler(async (req, res, next) => {
  const lembretes = await Lembrete.find()
    .populate('responsavel', 'nome')
    .populate('cliente', 'nome telefone')
    .populate('produto', 'nome quantidadeEstoque')
    .sort({ dataProximaExecucao: 1 });
  
  res.status(200).json({
    success: true,
    count: lembretes.length,
    data: lembretes
  });
});

// @desc    Obter um lembrete específico
// @route   GET /api/v1/lembretes/:id
// @access  Private
exports.getLembrete = asyncHandler(async (req, res, next) => {
  const lembrete = await Lembrete.findById(req.params.id)
    .populate('responsavel', 'nome')
    .populate('cliente', 'nome telefone email')
    .populate('produto', 'nome quantidadeEstoque');
  
  if (!lembrete) {
    return next(new ErrorResponse(`Lembrete não encontrado com o ID ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: lembrete
  });
});

// @desc    Criar um novo lembrete
// @route   POST /api/v1/lembretes
// @access  Private
exports.createLembrete = asyncHandler(async (req, res, next) => {
  // Verificar referências se existirem
  if (req.body.responsavel) {
    const responsavel = await Profissional.findById(req.body.responsavel);
    if (!responsavel) {
      return next(new ErrorResponse(`Profissional responsável não encontrado com o ID ${req.body.responsavel}`, 404));
    }
  }
  
  if (req.body.cliente) {
    const cliente = await Cliente.findById(req.body.cliente);
    if (!cliente) {
      return next(new ErrorResponse(`Cliente não encontrado com o ID ${req.body.cliente}`, 404));
    }
  }
  
  if (req.body.produto) {
    const produto = await Produto.findById(req.body.produto);
    if (!produto) {
      return next(new ErrorResponse(`Produto não encontrado com o ID ${req.body.produto}`, 404));
    }
  }
  
  const lembrete = await Lembrete.create(req.body);
  
  res.status(201).json({
    success: true,
    data: lembrete
  });
});

// @desc    Atualizar um lembrete
// @route   PUT /api/v1/lembretes/:id
// @access  Private
exports.updateLembrete = asyncHandler(async (req, res, next) => {
  let lembrete = await Lembrete.findById(req.params.id);
  
  if (!lembrete) {
    return next(new ErrorResponse(`Lembrete não encontrado com o ID ${req.params.id}`, 404));
  }
  
  lembrete = await Lembrete.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: lembrete
  });
});

// @desc    Excluir um lembrete
// @route   DELETE /api/v1/lembretes/:id
// @access  Private
exports.deleteLembrete = asyncHandler(async (req, res, next) => {
  const lembrete = await Lembrete.findById(req.params.id);
  
  if (!lembrete) {
    return next(new ErrorResponse(`Lembrete não encontrado com o ID ${req.params.id}`, 404));
  }
  
  // Marcar como cancelado em vez de excluir
  lembrete.status = 'cancelado';
  lembrete.ativo = false;
  await lembrete.save();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Marcar lembrete como concluído
// @route   PUT /api/v1/lembretes/:id/concluir
// @access  Private
exports.concluirLembrete = asyncHandler(async (req, res, next) => {
  const { observacoes, executor } = req.body;
  
  const lembrete = await Lembrete.findById(req.params.id);
  
  if (!lembrete) {
    return next(new ErrorResponse(`Lembrete não encontrado com o ID ${req.params.id}`, 404));
  }
  
  await lembrete.marcarConcluido(observacoes, executor);
  
  res.status(200).json({
    success: true,
    data: lembrete
  });
});

// @desc    Obter lembretes por tipo
// @route   GET /api/v1/lembretes/tipo/:tipo
// @access  Private
exports.getLembretesPorTipo = asyncHandler(async (req, res, next) => {
  const tipo = req.params.tipo;
  
  const lembretes = await Lembrete.find({
    tipo: tipo,
    status: { $in: ['pendente', 'atrasado'] },
    ativo: true
  })
    .populate('responsavel', 'nome')
    .sort({ dataProximaExecucao: 1 });
  
  res.status(200).json({
    success: true,
    count: lembretes.length,
    data: lembretes
  });
});

// @desc    Obter lembretes para hoje
// @route   GET /api/v1/lembretes/hoje
// @access  Private
exports.getLembretesHoje = asyncHandler(async (req, res, next) => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);
  
  const lembretes = await Lembrete.find({
    dataProximaExecucao: {
      $gte: hoje,
      $lt: amanha
    },
    status: { $in: ['pendente', 'atrasado'] },
    ativo: true
  })
    .populate('responsavel', 'nome')
    .populate('cliente', 'nome telefone')
    .populate('produto', 'nome')
    .sort({ prioridade: -1 });
  
  res.status(200).json({
    success: true,
    count: lembretes.length,
    data: lembretes
  });
});

// @desc    Obter lembretes atrasados
// @route   GET /api/v1/lembretes/atrasados
// @access  Private
exports.getLembretesAtrasados = asyncHandler(async (req, res, next) => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const lembretes = await Lembrete.find({
    $or: [
      { status: 'atrasado' },
      {
        dataProximaExecucao: { $lt: hoje },
        status: 'pendente'
      }
    ],
    ativo: true
  })
    .populate('responsavel', 'nome')
    .sort({ dataProximaExecucao: 1 });
  
  // Atualizar status para atrasado se necessário
  for (const lembrete of lembretes) {
    if (lembrete.status === 'pendente') {
      lembrete.status = 'atrasado';
      await lembrete.save();
    }
  }
  
  res.status(200).json({
    success: true,
    count: lembretes.length,
    data: lembretes
  });
});
