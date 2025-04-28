const cron = require('node-cron');
const moment = require('moment');
const { Cliente, Agendamento, Produto, Lembrete } = require('../../database/models');
const emailService = require('./emailService');

// Configuração do email do administrador
const EMAIL_ADMIN = process.env.EMAIL_FROM || 'salao.beleza.app@gmail.com';

/**
 * Agenda tarefas para serem executadas periodicamente
 */
const iniciarAgendador = () => {
  console.log('Iniciando agendador de tarefas...');

  // Enviar lembretes de agendamentos (todos os dias às 18:00)
  cron.schedule('0 18 * * *', async () => {
    console.log('Executando tarefa: Enviar lembretes de agendamentos');
    await enviarLembretesAgendamentos();
  });

  // Verificar clientes inativos (toda segunda-feira às 10:00)
  cron.schedule('0 10 * * 1', async () => {
    console.log('Executando tarefa: Verificar clientes inativos');
    await verificarClientesInativos();
  });

  // Verificar estoque baixo (todos os dias às 9:00)
  cron.schedule('0 9 * * *', async () => {
    console.log('Executando tarefa: Verificar estoque baixo');
    await verificarEstoqueBaixo();
  });

  // Verificar lembretes de limpeza e manutenção (todos os dias às 8:00)
  cron.schedule('0 8 * * *', async () => {
    console.log('Executando tarefa: Verificar lembretes de limpeza e manutenção');
    await verificarLembretesLimpezaManutencao();
  });

  console.log('Agendador de tarefas iniciado com sucesso!');
};

/**
 * Envia lembretes para agendamentos do dia seguinte
 */
const enviarLembretesAgendamentos = async () => {
  try {
    // Obter data de amanhã
    const amanha = moment().add(1, 'days').startOf('day');
    const fimAmanha = moment(amanha).endOf('day');

    // Buscar agendamentos para amanhã
    const agendamentos = await Agendamento.find({
      dataHora: {
        $gte: amanha.toDate(),
        $lte: fimAmanha.toDate()
      },
      status: { $in: ['agendado', 'confirmado'] }
    })
      .populate('cliente')
      .populate('profissional')
      .populate('servico');

    console.log(`Encontrados ${agendamentos.length} agendamentos para amanhã`);

    // Enviar lembretes por email
    for (const agendamento of agendamentos) {
      try {
        // Verificar se já foi enviado lembrete
        const lembreteJaEnviado = agendamento.notificacoes.some(
          notif => notif.tipo === 'lembrete' && notif.status === 'enviado'
        );

        if (!lembreteJaEnviado) {
          await emailService.enviarLembreteAgendamento(agendamento, agendamento.cliente);

          // Registrar notificação enviada
          agendamento.notificacoes.push({
            tipo: 'lembrete',
            dataEnvio: new Date(),
            status: 'enviado'
          });

          await agendamento.save();
          console.log(`Lembrete enviado para agendamento ID: ${agendamento._id}`);
        }
      } catch (error) {
        console.error(`Erro ao enviar lembrete para agendamento ID ${agendamento._id}:`, error);
        
        // Registrar falha na notificação
        agendamento.notificacoes.push({
          tipo: 'lembrete',
          dataEnvio: new Date(),
          status: 'falha'
        });
        
        await agendamento.save();
      }
    }
  } catch (error) {
    console.error('Erro ao enviar lembretes de agendamentos:', error);
  }
};

/**
 * Verifica clientes inativos e envia emails de reativação
 */
const verificarClientesInativos = async () => {
  try {
    // Definir período de inatividade (30 dias)
    const diasInatividade = 30;
    const dataLimite = moment().subtract(diasInatividade, 'days').toDate();

    // Buscar clientes inativos
    const clientesInativos = await Cliente.find({
      $or: [
        { ultimaVisita: { $lt: dataLimite } },
        { ultimaVisita: { $exists: false } }
      ],
      ativo: true
    });

    console.log(`Encontrados ${clientesInativos.length} clientes inativos`);

    // Enviar emails de reativação
    for (const cliente of clientesInativos) {
      try {
        // Calcular dias desde a última visita
        const diasSemVisita = cliente.ultimaVisita 
          ? cliente.calcularDiasSemVisita() 
          : diasInatividade;

        await emailService.enviarEmailClienteInativo(cliente, diasSemVisita);
        console.log(`Email de reativação enviado para cliente ID: ${cliente._id}`);
      } catch (error) {
        console.error(`Erro ao enviar email para cliente inativo ID ${cliente._id}:`, error);
      }
    }
  } catch (error) {
    console.error('Erro ao verificar clientes inativos:', error);
  }
};

/**
 * Verifica produtos com estoque baixo e envia alertas
 */
const verificarEstoqueBaixo = async () => {
  try {
    // Buscar produtos com estoque baixo
    const produtosEstoqueBaixo = await Produto.find({
      $expr: {
        $lte: ['$quantidadeEstoque', '$nivelMinimoEstoque']
      },
      ativo: true
    });

    console.log(`Encontrados ${produtosEstoqueBaixo.length} produtos com estoque baixo`);

    // Enviar alertas por email
    for (const produto of produtosEstoqueBaixo) {
      try {
        await emailService.enviarAlertaEstoqueBaixo(produto, EMAIL_ADMIN);
        console.log(`Alerta de estoque baixo enviado para produto ID: ${produto._id}`);
      } catch (error) {
        console.error(`Erro ao enviar alerta de estoque baixo para produto ID ${produto._id}:`, error);
      }
    }
  } catch (error) {
    console.error('Erro ao verificar produtos com estoque baixo:', error);
  }
};

/**
 * Verifica lembretes de limpeza e manutenção para o dia atual
 */
const verificarLembretesLimpezaManutencao = async () => {
  try {
    // Obter data atual
    const hoje = moment().startOf('day');
    const fimHoje = moment(hoje).endOf('day');

    // Buscar lembretes para hoje
    const lembretes = await Lembrete.find({
      dataProximaExecucao: {
        $gte: hoje.toDate(),
        $lte: fimHoje.toDate()
      },
      tipo: { $in: ['limpeza', 'manutencao'] },
      status: { $in: ['pendente', 'atrasado'] },
      ativo: true
    });

    console.log(`Encontrados ${lembretes.length} lembretes de limpeza/manutenção para hoje`);

    // Enviar lembretes por email
    for (const lembrete of lembretes) {
      try {
        await emailService.enviarLembreteLimpezaManutencao(lembrete, EMAIL_ADMIN);
        console.log(`Lembrete de ${lembrete.tipo} enviado para ID: ${lembrete._id}`);
      } catch (error) {
        console.error(`Erro ao enviar lembrete de ${lembrete.tipo} ID ${lembrete._id}:`, error);
      }
    }
  } catch (error) {
    console.error('Erro ao verificar lembretes de limpeza e manutenção:', error);
  }
};

module.exports = {
  iniciarAgendador,
  enviarLembretesAgendamentos,
  verificarClientesInativos,
  verificarEstoqueBaixo,
  verificarLembretesLimpezaManutencao
};
