const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const { Cliente, Produto } = require('../database/models');

describe('Testes de API - Produtos e Estoque', () => {
  // Dados para testes
  let produtoId;
  
  // Configuração antes dos testes
  beforeAll(async () => {
    // Criar produto de teste
    const produto = await Produto.create({
      nome: 'Produto Teste',
      descricao: 'Descrição do produto de teste',
      categoria: 'Cabelo',
      marca: 'Marca Teste',
      quantidadeEstoque: 10,
      unidadeMedida: 'unidade',
      nivelMinimoEstoque: 5,
      precoCompra: 50,
      precoVenda: 100
    });
    produtoId = produto._id;
  });
  
  // Limpeza após os testes
  afterAll(async () => {
    // Remover dados de teste
    if (produtoId) {
      await Produto.findByIdAndDelete(produtoId);
    }
    
    // Fechar conexão com o banco de dados
    await mongoose.connection.close();
  });
  
  // Testes
  
  // Teste de obtenção de produtos
  test('Deve listar todos os produtos', async () => {
    const response = await request(app)
      .get('/api/v1/produtos');
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
  
  // Teste de obtenção de produto específico
  test('Deve obter um produto específico', async () => {
    const response = await request(app)
      .get(`/api/v1/produtos/${produtoId}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data._id).toBe(produtoId.toString());
    expect(response.body.data.nome).toBe('Produto Teste');
  });
  
  // Teste de atualização de produto
  test('Deve atualizar um produto', async () => {
    const response = await request(app)
      .put(`/api/v1/produtos/${produtoId}`)
      .send({
        descricao: 'Descrição atualizada do produto de teste'
      });
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.descricao).toBe('Descrição atualizada do produto de teste');
  });
  
  // Teste de atualização de estoque
  test('Deve atualizar o estoque de um produto', async () => {
    const response = await request(app)
      .put(`/api/v1/produtos/${produtoId}/estoque`)
      .send({
        quantidade: 5,
        tipo: 'entrada',
        motivo: 'Reposição de estoque',
        responsavel: 'Administrador'
      });
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.quantidadeEstoque).toBe(15); // 10 inicial + 5 de entrada
    expect(response.body.data.historicoMovimentacao).toHaveLength(1);
  });
  
  // Teste de produtos com estoque baixo
  test('Deve listar produtos com estoque baixo', async () => {
    // Primeiro reduzir o estoque para ficar abaixo do mínimo
    await request(app)
      .put(`/api/v1/produtos/${produtoId}/estoque`)
      .send({
        quantidade: 12,
        tipo: 'saida',
        motivo: 'Teste de estoque baixo',
        responsavel: 'Administrador'
      });
    
    const response = await request(app)
      .get('/api/v1/produtos/estoque-baixo');
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    
    // Verificar se o produto de teste está na lista de estoque baixo
    const produtoEncontrado = response.body.data.find(p => p._id === produtoId.toString());
    expect(produtoEncontrado).toBeDefined();
    expect(produtoEncontrado.quantidadeEstoque).toBeLessThanOrEqual(produtoEncontrado.nivelMinimoEstoque);
  });
  
  // Teste de produtos por categoria
  test('Deve listar produtos por categoria', async () => {
    const response = await request(app)
      .get('/api/v1/produtos/categoria/Cabelo');
    
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    
    // Verificar se o produto de teste está na lista da categoria
    const produtoEncontrado = response.body.data.find(p => p._id === produtoId.toString());
    expect(produtoEncontrado).toBeDefined();
    expect(produtoEncontrado.categoria).toBe('Cabelo');
  });
});
