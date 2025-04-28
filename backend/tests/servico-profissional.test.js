const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const { Servico, Profissional } = require('../database/models');

describe('Testes de API - Serviços e Profissionais', () => {
  // Dados para testes
  let servicoId;
  let profissionalId;
  
  // Configuração antes dos testes
  beforeAll(async () => {
    // Criar profissional de teste
    const profissional = await Profissional.create({
      nome: 'Profissional Teste Serviços',
      telefone: '11777777777',
      email: 'profissional.servicos@example.com',
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
      nome: 'Serviço Teste API',
      descricao: 'Descrição do serviço de teste para API',
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
    await Servico.findByIdAndDelete(servicoId);
    await Profissional.findByIdAndDelete(profissionalId);
    
    // Fechar conexão com o banco de dados
    await mongoose.connection.close();
  });
  
  // Testes de Serviços
  
  // Teste de obtenção de serviços
  test('Deve listar todos os serviços', async () => {
    const response = await request(app)
      .get('/api/v1/servicos');
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
  
  // Teste de obtenção de serviço específico
  test('Deve obter um serviço específico', async () => {
    const response = await request(app)
      .get(`/api/v1/servicos/${servicoId}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data._id).toBe(servicoId.toString());
    expect(response.body.data.nome).toBe('Serviço Teste API');
  });
  
  // Teste de atualização de serviço
  test('Deve atualizar um serviço', async () => {
    const response = await request(app)
      .put(`/api/v1/servicos/${servicoId}`)
      .send({
        preco: 120,
        descricao: 'Descrição atualizada do serviço de teste'
      });
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.preco).toBe(120);
    expect(response.body.data.descricao).toBe('Descrição atualizada do serviço de teste');
  });
  
  // Teste de serviços por categoria
  test('Deve listar serviços por categoria', async () => {
    const response = await request(app)
      .get('/api/v1/servicos/categoria/Cabelo');
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    
    // Verificar se o serviço de teste está na lista da categoria
    const servicoEncontrado = response.body.data.find(s => s._id === servicoId.toString());
    expect(servicoEncontrado).toBeDefined();
    expect(servicoEncontrado.categoria).toBe('Cabelo');
  });
  
  // Testes de Profissionais
  
  // Teste de obtenção de profissionais
  test('Deve listar todos os profissionais', async () => {
    const response = await request(app)
      .get('/api/v1/profissionais');
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
  
  // Teste de obtenção de profissional específico
  test('Deve obter um profissional específico', async () => {
    const response = await request(app)
      .get(`/api/v1/profissionais/${profissionalId}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data._id).toBe(profissionalId.toString());
    expect(response.body.data.nome).toBe('Profissional Teste Serviços');
  });
  
  // Teste de atualização de profissional
  test('Deve atualizar um profissional', async () => {
    const response = await request(app)
      .put(`/api/v1/profissionais/${profissionalId}`)
      .send({
        especialidades: ['Cabelereiro', 'Manicure', 'Esteticista']
      });
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.especialidades).toContain('Esteticista');
  });
  
  // Teste de profissionais por especialidade
  test('Deve listar profissionais por especialidade', async () => {
    const response = await request(app)
      .get('/api/v1/profissionais/especialidade/Cabelereiro');
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    
    // Verificar se o profissional de teste está na lista da especialidade
    const profissionalEncontrado = response.body.data.find(p => p._id === profissionalId.toString());
    expect(profissionalEncontrado).toBeDefined();
    expect(profissionalEncontrado.especialidades).toContain('Cabelereiro');
  });
  
  // Teste de análise de desempenho de profissionais
  test('Deve analisar desempenho de profissionais', async () => {
    const response = await request(app)
      .get('/api/v1/analise/desempenho-profissionais/mes');
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('profissionais');
    expect(Array.isArray(response.body.data.profissionais)).toBe(true);
  });
});
