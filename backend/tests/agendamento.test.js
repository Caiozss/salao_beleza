const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const { Cliente, Profissional, Servico, Agendamento } = require('../database/models');

describe('Testes de API - Agendamentos', () => {
  // Dados para testes
  let clienteId;
  let profissionalId;
  let servicoId;
  let agendamentoId;
  
  // Configuração antes dos testes
  beforeAll(async () => {
    // Criar cliente de teste
    const cliente = await Cliente.create({
      nome: 'Cliente Teste',
      telefone: '11999999999',
      email: 'cliente.teste@example.com'
    });
    clienteId = cliente._id;
    
    // Criar profissional de teste
    const profissional = await Profissional.create({
      nome: 'Profissional Teste',
      telefone: '11888888888',
      email: 'profissional.teste@example.com',
      especialidades: ['Cabelereiro', 'Manicure'],
      horariosTrabalho: [
        {
          diaSemana: 1, // Segunda-feira
          horaInicio: '09:00',
          horaFim: '18:00'
        }
      ]
    });
    profissionalId = profissional._id;
    
    // Criar serviço de teste
    const servico = await Servico.create({
      nome: 'Serviço Teste',
      descricao: 'Descrição do serviço de teste',
      duracao: 60,
      preco: 100,
      categoria: 'Cabelo',
      profissionaisHabilitados: [profissionalId]
    });
    servicoId = servico._id;
  });
  
  // Limpeza após os testes
  afterAll(async () => {
    // Remover dados de teste
    await Cliente.findByIdAndDelete(clienteId);
    await Profissional.findByIdAndDelete(profissionalId);
    await Servico.findByIdAndDelete(servicoId);
    if (agendamentoId) {
      await Agendamento.findByIdAndDelete(agendamentoId);
    }
    
    // Fechar conexão com o banco de dados
    await mongoose.connection.close();
  });
  
  // Testes
  
  // Teste de criação de agendamento
  test('Deve criar um novo agendamento', async () => {
    // Data do agendamento (próxima segunda-feira)
    const dataAgendamento = new Date();
    dataAgendamento.setDate(dataAgendamento.getDate() + (8 - dataAgendamento.getDay()) % 7);
    dataAgendamento.setHours(10, 0, 0, 0);
    
    const response = await request(app)
      .post('/api/v1/agendamentos')
      .send({
        cliente: clienteId,
        profissional: profissionalId,
        servico: servicoId,
        dataHora: dataAgendamento,
        valorTotal: 100,
        status: 'agendado'
      });
    
    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('_id');
    
    // Guardar ID para uso em outros testes
    agendamentoId = response.body.data._id;
  });
  
  // Teste de obtenção de agendamentos
  test('Deve listar todos os agendamentos', async () => {
    const response = await request(app)
      .get('/api/v1/agendamentos');
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
  
  // Teste de obtenção de agendamento específico
  test('Deve obter um agendamento específico', async () => {
    const response = await request(app)
      .get(`/api/v1/agendamentos/${agendamentoId}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data._id).toBe(agendamentoId);
  });
  
  // Teste de atualização de agendamento
  test('Deve atualizar um agendamento', async () => {
    const response = await request(app)
      .put(`/api/v1/agendamentos/${agendamentoId}`)
      .send({
        status: 'confirmado'
      });
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('confirmado');
  });
  
  // Teste de verificação de disponibilidade
  test('Deve verificar disponibilidade de horários', async () => {
    // Data para verificação (próxima segunda-feira)
    const dataVerificacao = new Date();
    dataVerificacao.setDate(dataVerificacao.getDate() + (8 - dataVerificacao.getDay()) % 7);
    const dataFormatada = dataVerificacao.toISOString().split('T')[0];
    
    const response = await request(app)
      .post('/api/v1/agendamentos/disponibilidade')
      .send({
        profissionalId,
        servicoId,
        data: dataFormatada
      });
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty('disponibilidade');
    expect(Array.isArray(response.body.disponibilidade)).toBe(true);
  });
  
  // Teste de cancelamento de agendamento
  test('Deve cancelar um agendamento', async () => {
    const response = await request(app)
      .delete(`/api/v1/agendamentos/${agendamentoId}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    
    // Verificar se o status foi alterado para cancelado
    const agendamentoAtualizado = await Agendamento.findById(agendamentoId);
    expect(agendamentoAtualizado.status).toBe('cancelado');
  });
});
