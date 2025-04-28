const express = require('express');
const router = express.Router();
const { Cliente } = require('../../database/models');
const emailService = require('../services/emailService');
const asyncHandler = require('../middlewares/async');

// @desc    Enviar email para cliente inativo
// @route   POST /api/v1/notificacoes/cliente-inativo/:id
// @access  Private
const enviarEmailClienteInativo = asyncHandler(async (req, res, next) => {
  const cliente = await Cliente.findById(req.params.id);
  
  if (!cliente) {
    return res.status(404).json({
      success: false,
      error: 'Cliente não encontrado'
    });
  }
  
  if (!cliente.email) {
    return res.status(400).json({
      success: false,
      error: 'Cliente não possui email cadastrado'
    });
  }
  
  // Calcular dias desde a última visita
  const diasSemVisita = cliente.calcularDiasSemVisita() || 30;
  
  try {
    await emailService.enviarEmailClienteInativo(cliente, diasSemVisita);
    
    res.status(200).json({
      success: true,
      data: {
        message: 'Email enviado com sucesso'
      }
    });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao enviar email'
    });
  }
});

// @desc    Enviar email de confirmação de agendamento
// @route   POST /api/v1/notificacoes/confirmacao-agendamento/:id
// @access  Private
const enviarConfirmacaoAgendamento = asyncHandler(async (req, res, next) => {
  const { Agendamento } = require('../../database/models');
  
  const agendamento = await Agendamento.findById(req.params.id)
    .populate('cliente')
    .populate('profissional')
    .populate('servico');
  
  if (!agendamento) {
    return res.status(404).json({
      success: false,
      error: 'Agendamento não encontrado'
    });
  }
  
  if (!agendamento.cliente.email) {
    return res.status(400).json({
      success: false,
      error: 'Cliente não possui email cadastrado'
    });
  }
  
  try {
    await emailService.enviarConfirmacaoAgendamento(agendamento, agendamento.cliente);
    
    // Registrar notificação enviada
    agendamento.notificacoes.push({
      tipo: 'confirmacao',
      dataEnvio: new Date(),
      status: 'enviado'
    });
    
    await agendamento.save();
    
    res.status(200).json({
      success: true,
      data: {
        message: 'Email de confirmação enviado com sucesso'
      }
    });
  } catch (error) {
    console.error('Erro ao enviar email de confirmação:', error);
    
    // Registrar falha na notificação
    agendamento.notificacoes.push({
      tipo: 'confirmacao',
      dataEnvio: new Date(),
      status: 'falha'
    });
    
    await agendamento.save();
    
    res.status(500).json({
      success: false,
      error: 'Erro ao enviar email de confirmação'
    });
  }
});

// @desc    Enviar alerta de estoque baixo
// @route   POST /api/v1/notificacoes/alerta-estoque/:id
// @access  Private
const enviarAlertaEstoque = asyncHandler(async (req, res, next) => {
  const { Produto } = require('../../database/models');
  const { emailAdmin } = req.body;
  
  const produto = await Produto.findById(req.params.id);
  
  if (!produto) {
    return res.status(404).json({
      success: false,
      error: 'Produto não encontrado'
    });
  }
  
  if (!emailAdmin) {
    return res.status(400).json({
      success: false,
      error: 'Email do administrador não fornecido'
    });
  }
  
  try {
    await emailService.enviarAlertaEstoqueBaixo(produto, emailAdmin);
    
    res.status(200).json({
      success: true,
      data: {
        message: 'Alerta de estoque baixo enviado com sucesso'
      }
    });
  } catch (error) {
    console.error('Erro ao enviar alerta de estoque baixo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao enviar alerta de estoque baixo'
    });
  }
});

// @desc    Enviar lembrete de limpeza/manutenção
// @route   POST /api/v1/notificacoes/lembrete/:id
// @access  Private
const enviarLembreteLimpezaManutencao = asyncHandler(async (req, res, next) => {
  const { Lembrete } = require('../../database/models');
  const { emailAdmin } = req.body;
  
  const lembrete = await Lembrete.findById(req.params.id);
  
  if (!lembrete) {
    return res.status(404).json({
      success: false,
      error: 'Lembrete não encontrado'
    });
  }
  
  if (!emailAdmin) {
    return res.status(400).json({
      success: false,
      error: 'Email do administrador não fornecido'
    });
  }
  
  if (!['limpeza', 'manutencao'].includes(lembrete.tipo)) {
    return res.status(400).json({
      success: false,
      error: 'Tipo de lembrete inválido'
    });
  }
  
  try {
    await emailService.enviarLembreteLimpezaManutencao(lembrete, emailAdmin);
    
    res.status(200).json({
      success: true,
      data: {
        message: `Lembrete de ${lembrete.tipo} enviado com sucesso`
      }
    });
  } catch (error) {
    console.error(`Erro ao enviar lembrete de ${lembrete.tipo}:`, error);
    res.status(500).json({
      success: false,
      error: `Erro ao enviar lembrete de ${lembrete.tipo}`
    });
  }
});

// Definir rotas
router.post('/cliente-inativo/:id', enviarEmailClienteInativo);
router.post('/confirmacao-agendamento/:id', enviarConfirmacaoAgendamento);
router.post('/alerta-estoque/:id', enviarAlertaEstoque);
router.post('/lembrete/:id', enviarLembreteLimpezaManutencao);

module.exports = router;
