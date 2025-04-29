const mongoose = require('mongoose');
const clienteSchema = require('../schemas/clienteSchema');
const profissionalSchema = require('../schemas/profissionalSchema');
const servicoSchema = require('../schemas/servicoSchema');
const agendamentoSchema = require('../schemas/agendamentoSchema');
const produtoSchema = require('../schemas/produtoSchema');
const lembreteSchema = require('../schemas/lembreteSchema');

// Criação dos modelos a partir dos esquemas
const Cliente = mongoose.model('Cliente', clienteSchema);
const Profissional = mongoose.model('Profissional', profissionalSchema);
const Servico = mongoose.model('Servico', servicoSchema);
const Agendamento = mongoose.model('Agendamento', agendamentoSchema);
const Produto = mongoose.model('Produto', produtoSchema);
const Lembrete = mongoose.model('Lembrete', lembreteSchema);

module.exports = {
  Cliente,
  Profissional,
  Servico,
  Agendamento,
  Produto,
  Lembrete
};
