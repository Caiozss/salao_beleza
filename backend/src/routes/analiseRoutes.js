const express = require('express');
const router = express.Router();
const { Cliente } = require('../../database/models');
const asyncHandler = require('../middlewares/async');

// @desc    Analisar clientes inativos
// @route   GET /api/v1/analise/clientes-inativos/:dias
// @access  Private
const analisarClientesInativos = asyncHandler(async (req, res, next) => {
  const diasInatividade = parseInt(req.params.dias) || 30;
  
  // Calcular data limite
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - diasInatividade);
  
  // Buscar clientes inativos
  const clientesInativos = await Cliente.find({
    $or: [
      { ultimaVisita: { $lt: dataLimite } },
      { ultimaVisita: { $exists: false } }
    ],
    ativo: true
  }).sort({ ultimaVisita: 1 });
  
  // Calcular estatísticas
  const totalClientes = await Cliente.countDocuments({ ativo: true });
  const percentualInativos = (clientesInativos.length / totalClientes) * 100;
  
  // Agrupar por tempo de inatividade
  const grupos = {
    '1-3 meses': 0,
    '3-6 meses': 0,
    '6-12 meses': 0,
    'Mais de 12 meses': 0
  };
  
  for (const cliente of clientesInativos) {
    if (cliente.ultimaVisita) {
      const hoje = new Date();
      const ultimaVisita = new Date(cliente.ultimaVisita);
      const diffTempo = Math.abs(hoje - ultimaVisita);
      const diffMeses = Math.ceil(diffTempo / (1000 * 60 * 60 * 24 * 30));
      
      if (diffMeses <= 3) {
        grupos['1-3 meses']++;
      } else if (diffMeses <= 6) {
        grupos['3-6 meses']++;
      } else if (diffMeses <= 12) {
        grupos['6-12 meses']++;
      } else {
        grupos['Mais de 12 meses']++;
      }
    } else {
      grupos['Mais de 12 meses']++;
    }
  }
  
  res.status(200).json({
    success: true,
    data: {
      totalClientesInativos: clientesInativos.length,
      totalClientes,
      percentualInativos: percentualInativos.toFixed(2),
      distribuicaoPorTempo: grupos,
      clientesInativos: clientesInativos.map(cliente => ({
        id: cliente._id,
        nome: cliente.nome,
        telefone: cliente.telefone,
        email: cliente.email,
        ultimaVisita: cliente.ultimaVisita,
        diasSemVisita: cliente.calcularDiasSemVisita()
      }))
    }
  });
});

// @desc    Analisar serviços mais procurados
// @route   GET /api/v1/analise/servicos-populares/:periodo
// @access  Private
const analisarServicosMaisProcurados = asyncHandler(async (req, res, next) => {
  const { Agendamento } = require('../../database/models');
  
  const periodo = req.params.periodo || 'mes'; // dia, semana, mes, ano
  
  // Calcular data inicial com base no período
  const dataInicial = new Date();
  switch (periodo) {
    case 'dia':
      dataInicial.setHours(0, 0, 0, 0);
      break;
    case 'semana':
      dataInicial.setDate(dataInicial.getDate() - 7);
      break;
    case 'mes':
      dataInicial.setMonth(dataInicial.getMonth() - 1);
      break;
    case 'ano':
      dataInicial.setFullYear(dataInicial.getFullYear() - 1);
      break;
    default:
      dataInicial.setMonth(dataInicial.getMonth() - 1);
  }
  
  // Buscar agendamentos no período
  const agendamentos = await Agendamento.find({
    dataHora: { $gte: dataInicial },
    status: { $in: ['concluido', 'confirmado', 'agendado'] }
  }).populate('servico');
  
  // Agrupar por serviço
  const servicosContagem = {};
  const servicosValor = {};
  
  for (const agendamento of agendamentos) {
    if (agendamento.servico) {
      const servicoId = agendamento.servico._id.toString();
      const servicoNome = agendamento.servico.nome;
      
      if (!servicosContagem[servicoId]) {
        servicosContagem[servicoId] = {
          id: servicoId,
          nome: servicoNome,
          quantidade: 0,
          valorTotal: 0
        };
      }
      
      servicosContagem[servicoId].quantidade++;
      servicosContagem[servicoId].valorTotal += agendamento.valorTotal || 0;
    }
  }
  
  // Converter para array e ordenar por quantidade
  const servicosPopulares = Object.values(servicosContagem).sort((a, b) => b.quantidade - a.quantidade);
  
  // Calcular total de agendamentos e valor
  const totalAgendamentos = agendamentos.length;
  const totalValor = servicosPopulares.reduce((sum, servico) => sum + servico.valorTotal, 0);
  
  // Calcular percentuais
  for (const servico of servicosPopulares) {
    servico.percentual = ((servico.quantidade / totalAgendamentos) * 100).toFixed(2);
    servico.valorMedio = (servico.valorTotal / servico.quantidade).toFixed(2);
  }
  
  res.status(200).json({
    success: true,
    data: {
      periodo,
      totalAgendamentos,
      totalValor: totalValor.toFixed(2),
      servicos: servicosPopulares
    }
  });
});

// @desc    Analisar desempenho dos profissionais
// @route   GET /api/v1/analise/desempenho-profissionais/:periodo
// @access  Private
const analisarDesempenhoProfissionais = asyncHandler(async (req, res, next) => {
  const { Agendamento } = require('../../database/models');
  
  const periodo = req.params.periodo || 'mes'; // dia, semana, mes, ano
  
  // Calcular data inicial com base no período
  const dataInicial = new Date();
  switch (periodo) {
    case 'dia':
      dataInicial.setHours(0, 0, 0, 0);
      break;
    case 'semana':
      dataInicial.setDate(dataInicial.getDate() - 7);
      break;
    case 'mes':
      dataInicial.setMonth(dataInicial.getMonth() - 1);
      break;
    case 'ano':
      dataInicial.setFullYear(dataInicial.getFullYear() - 1);
      break;
    default:
      dataInicial.setMonth(dataInicial.getMonth() - 1);
  }
  
  // Buscar agendamentos no período
  const agendamentos = await Agendamento.find({
    dataHora: { $gte: dataInicial },
    status: { $in: ['concluido', 'confirmado', 'agendado'] }
  })
    .populate('profissional')
    .populate('servico');
  
  // Agrupar por profissional
  const profissionaisDesempenho = {};
  
  for (const agendamento of agendamentos) {
    if (agendamento.profissional) {
      const profissionalId = agendamento.profissional._id.toString();
      const profissionalNome = agendamento.profissional.nome;
      
      if (!profissionaisDesempenho[profissionalId]) {
        profissionaisDesempenho[profissionalId] = {
          id: profissionalId,
          nome: profissionalNome,
          totalAgendamentos: 0,
          agendamentosConcluidos: 0,
          valorTotal: 0,
          servicos: {}
        };
      }
      
      profissionaisDesempenho[profissionalId].totalAgendamentos++;
      
      if (agendamento.status === 'concluido') {
        profissionaisDesempenho[profissionalId].agendamentosConcluidos++;
        profissionaisDesempenho[profissionalId].valorTotal += agendamento.valorTotal || 0;
      }
      
      // Contabilizar serviços realizados
      if (agendamento.servico) {
        const servicoId = agendamento.servico._id.toString();
        const servicoNome = agendamento.servico.nome;
        
        if (!profissionaisDesempenho[profissionalId].servicos[servicoId]) {
          profissionaisDesempenho[profissionalId].servicos[servicoId] = {
            id: servicoId,
            nome: servicoNome,
            quantidade: 0
          };
        }
        
        profissionaisDesempenho[profissionalId].servicos[servicoId].quantidade++;
      }
    }
  }
  
  // Converter serviços para array e calcular estatísticas
  for (const profissionalId in profissionaisDesempenho) {
    const profissional = profissionaisDesempenho[profissionalId];
    
    // Converter serviços para array
    profissional.servicosRealizados = Object.values(profissional.servicos).sort((a, b) => b.quantidade - a.quantidade);
    delete profissional.servicos;
    
    // Calcular taxa de conclusão
    profissional.taxaConclusao = ((profissional.agendamentosConcluidos / profissional.totalAgendamentos) * 100).toFixed(2);
    
    // Calcular valor médio por agendamento
    profissional.valorMedio = profissional.agendamentosConcluidos > 0 
      ? (profissional.valorTotal / profissional.agendamentosConcluidos).toFixed(2)
      : '0.00';
  }
  
  // Converter para array e ordenar por total de agendamentos
  const profissionais = Object.values(profissionaisDesempenho).sort((a, b) => b.totalAgendamentos - a.totalAgendamentos);
  
  res.status(200).json({
    success: true,
    data: {
      periodo,
      totalProfissionais: profissionais.length,
      profissionais
    }
  });
});

// @desc    Analisar uso de produtos
// @route   GET /api/v1/analise/uso-produtos/:periodo
// @access  Private
const analisarUsoProdutos = asyncHandler(async (req, res, next) => {
  const { Produto } = require('../../database/models');
  
  const periodo = req.params.periodo || 'mes'; // dia, semana, mes, ano
  
  // Calcular data inicial com base no período
  const dataInicial = new Date();
  switch (periodo) {
    case 'dia':
      dataInicial.setHours(0, 0, 0, 0);
      break;
    case 'semana':
      dataInicial.setDate(dataInicial.getDate() - 7);
      break;
    case 'mes':
      dataInicial.setMonth(dataInicial.getMonth() - 1);
      break;
    case 'ano':
      dataInicial.setFullYear(dataInicial.getFullYear() - 1);
      break;
    default:
      dataInicial.setMonth(dataInicial.getMonth() - 1);
  }
  
  // Buscar produtos
  const produtos = await Produto.find({ ativo: true });
  
  // Analisar histórico de movimentação
  const produtosAnalise = [];
  
  for (const produto of produtos) {
    // Filtrar movimentações no período
    const movimentacoesPeriodo = produto.historicoMovimentacao.filter(
      mov => new Date(mov.data) >= dataInicial
    );
    
    // Calcular totais
    let entradas = 0;
    let saidas = 0;
    let ajustes = 0;
    
    for (const mov of movimentacoesPeriodo) {
      if (mov.tipo === 'entrada') {
        entradas += mov.quantidade;
      } else if (mov.tipo === 'saida') {
        saidas += mov.quantidade;
      } else if (mov.tipo === 'ajuste') {
        // Não contabilizar ajustes no total
        ajustes++;
      }
    }
    
    // Adicionar à análise se houver movimentação
    if (movimentacoesPeriodo.length > 0) {
      produtosAnalise.push({
        id: produto._id,
        nome: produto.nome,
        categoria: produto.categoria,
        quantidadeAtual: produto.quantidadeEstoque,
        unidadeMedida: produto.unidadeMedida,
        entradas,
        saidas,
        ajustes,
        totalMovimentacoes: movimentacoesPeriodo.length,
        estoqueMinimo: produto.nivelMinimoEstoque,
        estoqueBaixo: produto.quantidadeEstoque <= produto.nivelMinimoEstoque
      });
    }
  }
  
  // Ordenar por quantidade de saídas (mais utilizados primeiro)
  produtosAnalise.sort((a, b) => b.saidas - a.saidas);
  
  // Calcular estatísticas gerais
  const totalProdutos = produtosAnalise.length;
  const totalSaidas = produtosAnalise.reduce((sum, produto) => sum + produto.saidas, 0);
  const produtosEstoqueBaixo = produtosAnalise.filter(produto => produto.estoqueBaixo).length;
  
  res.status(200).json({
    success: true,
    data: {
      periodo,
      totalProdutos,
      totalSaidas,
      produtosEstoqueBaixo,
      produtos: produtosAnalise
    }
  });
});

// Definir rotas
router.get('/clientes-inativos/:dias', analisarClientesInativos);
router.get('/servicos-populares/:periodo', analisarServicosMaisProcurados);
router.get('/desempenho-profissionais/:periodo', analisarDesempenhoProfissionais);
router.get('/uso-produtos/:periodo', analisarUsoProdutos);

module.exports = router;
