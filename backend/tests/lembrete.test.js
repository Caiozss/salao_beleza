const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const { Cliente, Lembrete } = require('../database/models');

describe('Testes de API - Lembretes', () => {
  // Dados para testes
  let lembreteId;
  
  // Configuração antes dos testes
  beforeAll(async () => {
    // Criar lembrete de teste
    const dataProxima = new Date();
    dataProxima.setDate(dataProxima.getDate() + 1); // Amanhã
    
    const lembrete = await Lembrete.create({
      tipo: 'limpeza',
      titulo: 'Limpeza de Teste',
      descricao: 'Descrição do lembrete de teste',
      frequencia: {
        tipo: 'semanal',
        diasSemana: [1, 3, 5] // Segunda, Quarta, Sexta
      },
      dataProximaExecucao: dataProxima,
      prioridade: 'media',
      status: 'pendente',
      notificacoes: {
        antecedencia: 24,
        enviarEmail: true,
        enviarPush: true
      }
    });
    lembreteId = lembrete._id;
  });
  
  // Limpeza após os testes
  afterAll(async () => {
    // Remover dados de teste
    if (lembreteId) {
      await Lembrete.findByIdAndDelete(lembreteId);
    }
    
    // Fechar conexão com o banco de dados
    await mongoose.connection.close();
  });
  
  // Testes
  
  // Teste de obtenção de lembretes
  test('Deve listar todos os lembretes', async () => {
    const response = await request(app)
      .get('/api/v1/lembretes');
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
  
  // Teste de obtenção de lembrete específico
  test('Deve obter um lembrete específico', async () => {
    const response = await request(app)
      .get(`/api/v1/lembretes/${lembreteId}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data._id).toBe(lembreteId.toString());
    expect(response.body.data.titulo).toBe('Limpeza de Teste');
  });
  
  // Teste de atualização de lembrete
  test('Deve atualizar um lembrete', async () => {
    const response = await request(app)
      .put(`/api/v1/lembretes/${lembreteId}`)
      .send({
        descricao: 'Descrição atualizada do lembrete de teste',
        prioridade: 'alta'
      });
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.descricao).toBe('Descrição atualizada do lembrete de teste');
    expect(response.body.data.prioridade).toBe('alta');
  });
  
  // Teste de conclusão de lembrete
  test('Deve marcar um lembrete como concluído', async () => {
    const response = await request(app)
      .put(`/api/v1/lembretes/${lembreteId}/concluir`)
      .send({
        observacoes: 'Lembrete concluído com sucesso',
        executor: 'Administrador'
      });
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('concluido');
    expect(response.body.data.historicoExecucoes).toHaveLength(1);
    expect(response.body.data.historicoExecucoes[0].observacoes).toBe('Lembrete concluído com sucesso');
  });
  
  // Teste de lembretes por tipo
  test('Deve listar lembretes por tipo', async () => {
    const response = await request(app)
      .get('/api/v1/lembretes/tipo/limpeza');
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
  
  // Teste de lembretes para hoje
  test('Deve listar lembretes para hoje', async () => {
    // Primeiro, criar um lembrete para hoje
    const hoje = new Date();
    hoje.setHours(10, 0, 0, 0);
    
    const lembreteHoje = await Lembrete.create({
      tipo: 'limpeza',
      titulo: 'Lembrete para Hoje',
      descricao: 'Lembrete que deve aparecer na lista de hoje',
      dataProximaExecucao: hoje,
      prioridade: 'alta',
      status: 'pendente'
    });
    
    const response = await request(app)
      .get('/api/v1/lembretes/hoje');
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    
    // Verificar se o lembrete de hoje está na lista
    const lembreteEncontrado = response.body.data.find(l => l._id === lembreteHoje._id.toString());
    expect(lembreteEncontrado).toBeDefined();
    
    // Limpar lembrete de teste
    await Lembrete.findByIdAndDelete(lembreteHoje._id);
  });
});
