const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const { Agendamento, Cliente, Profissional, Servico } = require('../../database/models');
const moment = require('moment');

// @desc    Obter todos os agendamentos
// @route   GET /api/v1/agendamentos
// @access  Private
exports.getAgendamentos = asyncHandler(async (req, res, next) => {
  const agendamentos = await Agendamento.find()
    .populate('cliente', 'nome telefone')
    .populate('profissional', 'nome')
    .populate('servico', 'nome duracao preco')
    .sort({ dataHora: 1 });
  
  res.status(200).json({
    success: true,
    count: agendamentos.length,
    data: agendamentos
  });
});

// @desc    Obter um agendamento específico
// @route   GET /api/v1/agendamentos/:id
// @access  Private
exports.getAgendamento = asyncHandler(async (req, res, next) => {
  const agendamento = await Agendamento.findById(req.params.id)
    .populate('cliente', 'nome telefone email')
    .populate('profissional', 'nome')
    .populate('servico', 'nome duracao preco')
    .populate('produtosUtilizados.produto', 'nome');
  
  if (!agendamento) {
    return next(new ErrorResponse(`Agendamento não encontrado com o ID ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: agendamento
  });
});

// @desc    Criar um novo agendamento
// @route   POST /api/v1/agendamentos
// @access  Private
exports.createAgendamento = asyncHandler(async (req, res, next) => {
  // Verificar se cliente, profissional e serviço existem
  const cliente = await Cliente.findById(req.body.cliente);
  if (!cliente) {
    return next(new ErrorResponse(`Cliente não encontrado com o ID ${req.body.cliente}`, 404));
  }
  
  const profissional = await Profissional.findById(req.body.profissional);
  if (!profissional) {
    return next(new ErrorResponse(`Profissional não encontrado com o ID ${req.body.profissional}`, 404));
  }
  
  const servico = await Servico.findById(req.body.servico);
  if (!servico) {
    return next(new ErrorResponse(`Serviço não encontrado com o ID ${req.body.servico}`, 404));
  }
  
  // Verificar se o profissional está habilitado para o serviço
  if (!servico.profissionaisHabilitados.includes(req.body.profissional)) {
    return next(new ErrorResponse(`O profissional selecionado não está habilitado para este serviço`, 400));
  }
  
  // Verificar disponibilidade de horário
  const dataHora = new Date(req.body.dataHora);
  const duracao = servico.duracao;
  const fimAgendamento = new Date(dataHora);
  fimAgendamento.setMinutes(fimAgendamento.getMinutes() + duracao);
  
  const agendamentosConflitantes = await Agendamento.find({
    profissional: req.body.profissional,
    status: { $in: ['agendado', 'confirmado'] },
    $or: [
      {
        dataHora: {
          $gte: dataHora,
          $lt: fimAgendamento
        }
      },
      {
        $expr: {
          $and: [
            { $lt: ['$dataHora', dataHora] },
            {
              $gt: [
                { $add: ['$dataHora', { $multiply: ['$servico.duracao', 60000] }] },
                dataHora
              ]
            }
          ]
        }
      }
    ]
  }).populate('servico', 'duracao');
  
  if (agendamentosConflitantes.length > 0) {
    return next(new ErrorResponse(`Horário indisponível para o profissional selecionado`, 400));
  }
  
  // Definir valor total baseado no preço do serviço
  req.body.valorTotal = servico.preco;
  
  // Criar o agendamento
  const agendamento = await Agendamento.create(req.body);
  
  // Atualizar a última visita do cliente
  cliente.ultimaVisita = dataHora;
  await cliente.save();
  
  res.status(201).json({
    success: true,
    data: agendamento
  });
});

// @desc    Atualizar um agendamento
// @route   PUT /api/v1/agendamentos/:id
// @access  Private
exports.updateAgendamento = asyncHandler(async (req, res, next) => {
  let agendamento = await Agendamento.findById(req.params.id);
  
  if (!agendamento) {
    return next(new ErrorResponse(`Agendamento não encontrado com o ID ${req.params.id}`, 404));
  }
  
  // Se estiver alterando o status para concluído, atualizar a última visita do cliente
  if (req.body.status === 'concluido' && agendamento.status !== 'concluido') {
    const cliente = await Cliente.findById(agendamento.cliente);
    if (cliente) {
      cliente.ultimaVisita = new Date();
      await cliente.save();
    }
  }
  
  agendamento = await Agendamento.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: agendamento
  });
});

// @desc    Excluir um agendamento
// @route   DELETE /api/v1/agendamentos/:id
// @access  Private
exports.deleteAgendamento = asyncHandler(async (req, res, next) => {
  const agendamento = await Agendamento.findById(req.params.id);
  
  if (!agendamento) {
    return next(new ErrorResponse(`Agendamento não encontrado com o ID ${req.params.id}`, 404));
  }
  
  // Marcar como cancelado em vez de excluir
  agendamento.status = 'cancelado';
  await agendamento.save();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Obter agendamentos por data
// @route   GET /api/v1/agendamentos/data/:data
// @access  Private
exports.getAgendamentosPorData = asyncHandler(async (req, res, next) => {
  const data = req.params.data; // Formato: YYYY-MM-DD
  
  const dataInicio = new Date(data);
  dataInicio.setHours(0, 0, 0, 0);
  
  const dataFim = new Date(data);
  dataFim.setHours(23, 59, 59, 999);
  
  const agendamentos = await Agendamento.find({
    dataHora: {
      $gte: dataInicio,
      $lte: dataFim
    },
    status: { $in: ['agendado', 'confirmado'] }
  })
    .populate('cliente', 'nome telefone')
    .populate('profissional', 'nome')
    .populate('servico', 'nome duracao')
    .sort({ dataHora: 1 });
  
  res.status(200).json({
    success: true,
    count: agendamentos.length,
    data: agendamentos
  });
});

// @desc    Obter agendamentos por profissional
// @route   GET /api/v1/agendamentos/profissional/:id
// @access  Private
exports.getAgendamentosPorProfissional = asyncHandler(async (req, res, next) => {
  const profissionalId = req.params.id;
  
  const agendamentos = await Agendamento.find({
    profissional: profissionalId,
    status: { $in: ['agendado', 'confirmado'] },
    dataHora: { $gte: new Date() }
  })
    .populate('cliente', 'nome telefone')
    .populate('servico', 'nome duracao')
    .sort({ dataHora: 1 });
  
  res.status(200).json({
    success: true,
    count: agendamentos.length,
    data: agendamentos
  });
});

// @desc    Obter agendamentos por cliente
// @route   GET /api/v1/agendamentos/cliente/:id
// @access  Private
exports.getAgendamentosPorCliente = asyncHandler(async (req, res, next) => {
  const clienteId = req.params.id;
  
  const agendamentos = await Agendamento.find({
    cliente: clienteId
  })
    .populate('profissional', 'nome')
    .populate('servico', 'nome duracao preco')
    .sort({ dataHora: -1 });
  
  res.status(200).json({
    success: true,
    count: agendamentos.length,
    data: agendamentos
  });
});

// @desc    Verificar disponibilidade de horários
// @route   POST /api/v1/agendamentos/disponibilidade
// @access  Public
exports.verificarDisponibilidade = asyncHandler(async (req, res, next) => {
  const { profissionalId, servicoId, data } = req.body;
  
  // Verificar se profissional e serviço existem
  const profissional = await Profissional.findById(profissionalId);
  if (!profissional) {
    return next(new ErrorResponse(`Profissional não encontrado com o ID ${profissionalId}`, 404));
  }
  
  const servico = await Servico.findById(servicoId);
  if (!servico) {
    return next(new ErrorResponse(`Serviço não encontrado com o ID ${servicoId}`, 404));
  }
  
  // Verificar se o profissional está habilitado para o serviço
  if (!servico.profissionaisHabilitados.includes(profissionalId)) {
    return next(new ErrorResponse(`O profissional selecionado não está habilitado para este serviço`, 400));
  }
  
  // Obter o dia da semana (0 = Domingo, 1 = Segunda, etc.)
  const dataObj = new Date(data);
  const diaSemana = dataObj.getDay();
  
  // Verificar se o profissional trabalha neste dia
  const horarioTrabalho = profissional.horariosTrabalho.find(h => h.diaSemana === diaSemana);
  if (!horarioTrabalho) {
    return res.status(200).json({
      success: true,
      disponibilidade: [],
      message: 'O profissional não trabalha neste dia'
    });
  }
  
  // Converter horários de trabalho para minutos desde o início do dia
  const [horaInicio, minInicio] = horarioTrabalho.horaInicio.split(':').map(Number);
  const [horaFim, minFim] = horarioTrabalho.horaFim.split(':').map(Number);
  
  const inicioMinutos = horaInicio * 60 + minInicio;
  const fimMinutos = horaFim * 60 + minFim;
  
  // Duração do serviço em minutos
  const duracaoServico = servico.duracao;
  
  // Obter todos os agendamentos do profissional para o dia
  const dataInicio = new Date(data);
  dataInicio.setHours(0, 0, 0, 0);
  
  const dataFim = new Date(data);
  dataFim.setHours(23, 59, 59, 999);
  
  const agendamentos = await Agendamento.find({
    profissional: profissionalId,
    dataHora: {
      $gte: dataInicio,
      $lte: dataFim
    },
    status: { $in: ['agendado', 'confirmado'] }
  }).populate('servico', 'duracao');
  
  // Criar slots de horários disponíveis (a cada 30 minutos)
  const horariosDisponiveis = [];
  
  for (let minutos = inicioMinutos; minutos <= fimMinutos - duracaoServico; minutos += 30) {
    const hora = Math.floor(minutos / 60);
    const min = minutos % 60;
    
    const horarioSlot = new Date(data);
    horarioSlot.setHours(hora, min, 0, 0);
    
    // Verificar se o horário não conflita com agendamentos existentes
    const horarioFimSlot = new Date(horarioSlot);
    horarioFimSlot.setMinutes(horarioFimSlot.getMinutes() + duracaoServico);
    
    const conflito = agendamentos.some(agendamento => {
      const agendamentoInicio = new Date(agendamento.dataHora);
      const agendamentoFim = new Date(agendamentoInicio);
      agendamentoFim.setMinutes(agendamentoFim.getMinutes() + agendamento.servico.duracao);
      
      return (
        (horarioSlot >= agendamentoInicio && horarioSlot < agendamentoFim) ||
        (horarioFimSlot > agendamentoInicio && horarioFimSlot <= agendamentoFim) ||
        (horarioSlot <= agendamentoInicio && horarioFimSlot >= agendamentoFim)
      );
    });
    
    if (!conflito) {
      horariosDisponiveis.push({
        hora: horarioSlot.toISOString(),
        formatado: `${hora.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
      });
    }
  }
  
  res.status(200).json({
    success: true,
    count: horariosDisponiveis.length,
    disponibilidade: horariosDisponiveis
  });
});
