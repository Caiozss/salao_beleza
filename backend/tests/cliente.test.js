const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const { Cliente, Profissional, Servico } = require('../database/models');

describe('Testes de API - Clientes e Análise de Inatividade', () => {
  // Dados para testes
  let clienteId;
  let clienteInativoId;
  
  // Configuração antes dos testes
  beforeAll(async () => {
    // Criar cliente ativo de teste
    const cliente = await Cliente.create({
      nome: 'Cliente Ativo Teste',
      telefone: '11999999999',
      email: 'cliente.ativo@example.com',
      ultimaVisita: new Date()
    });
    clienteId = cliente._id;
    
    // Criar cliente inativo de teste
    const dataInativa = new Date();
    dataInativa.setMonth(dataInativa.getMonth() - 2); // 2 meses atrás
    
    const clienteInativo = await Cliente.create({
      nome: 'Cliente Inativo Teste',
      telefone: '11888888888',
      email: 'cliente.inativo@example.com',
      ultimaVisita: dataInativa
    });
    clienteInativoId = clienteInativo._id;
  });
  
  // Limpeza após os testes
  afterAll(async () => {
    // Remover dados de teste
    await Cliente.findByIdAndDelete(clienteId);
    await Cliente.findByIdAndDelete(clienteInativoId);
    
    // Fechar conexão com o banco de dados
    await mongoose.connection.close();
  });
  
  // Testes
  
  // Teste de obtenção de clientes
  test('Deve listar todos os clientes', async () => {
    const response = await request(app)
      .get('/api/v1/clientes');
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
  
  // Teste de obtenção de cliente específico
  test('Deve obter um cliente específico', async () => {
    const response = await request(app)
      .get(`/api/v1/clientes/${clienteId}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data._id).toBe(clienteId.toString());
    expect(response.body.data.nome).toBe('Cliente Ativo Teste');
  });
  
  // Teste de atualização de cliente
  test('Deve atualizar um cliente', async () => {
    const response = await request(app)
      .put(`/api/v1/clientes/${clienteId}`)
      .send({
        endereco: {
          rua: 'Rua de Teste',
          numero: '123',
          bairro: 'Bairro Teste',
          cidade: 'Cidade Teste',
          estado: 'SP',
          cep: '01234-567'
        }
      });
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.endereco).toBeDefined();
    expect(response.body.data.endereco.rua).toBe('Rua de Teste');
  });
  
  // Teste de busca de cliente por telefone
  test('Deve buscar cliente por telefone', async () => {
    const response = await request(app)
      .get('/api/v1/clientes?telefone=11999999999');
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0].telefone).toBe('11999999999');
  });
  
  // Teste de análise de clientes inativos
  test('Deve analisar clientes inativos', async () => {
    const response = await request(app)
      .get('/api/v1/analise/clientes-inativos/30');
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('totalClientesInativos');
    expect(response.body.data).toHaveProperty('percentualInativos');
    expect(response.body.data).toHaveProperty('clientesInativos');
    expect(Array.isArray(response.body.data.clientesInativos)).toBe(true);
    
    // Verificar se o cliente inativo de teste está na lista
    const clienteEncontrado = response.body.data.clientesInativos.find(c => c.id === clienteInativoId.toString());
    expect(clienteEncontrado).toBeDefined();
    expect(clienteEncontrado.diasSemVisita).toBeGreaterThan(30);
  });
  
  // Teste de atualização da última visita
  test('Deve atualizar a última visita de um cliente', async () => {
    const response = await request(app)
      .put(`/api/v1/clientes/${clienteInativoId}/ultima-visita`)
      .send({
        data: new Date()
      });
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    
    // Verificar se a data foi atualizada
    const clienteAtualizado = await Cliente.findById(clienteInativoId);
    expect(clienteAtualizado.ultimaVisita).toBeDefined();
    
    // A data atualizada deve ser recente (menos de 1 dia)
    const diffTempo = Math.abs(new Date() - new Date(clienteAtualizado.ultimaVisita));
    const diffDias = diffTempo / (1000 * 60 * 60 * 24);
    expect(diffDias).toBeLessThan(1);
  });
});
