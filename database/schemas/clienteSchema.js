const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true
  },
  telefone: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  dataNascimento: {
    type: Date
  },
  ultimaVisita: {
    type: Date
  },
  diasSemVisita: {
    type: Number,
    default: 0
  },
  preferencias: {
    type: [String],
    default: []
  },
  observacoes: {
    type: String
  },
  ativo: {
    type: Boolean,
    default: true
  },
  dataCadastro: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Método para calcular dias desde a última visita
clienteSchema.methods.calcularDiasSemVisita = function() {
  if (!this.ultimaVisita) return null;
  
  const hoje = new Date();
  const ultimaVisita = new Date(this.ultimaVisita);
  const diffTempo = Math.abs(hoje - ultimaVisita);
  const diffDias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));
  
  this.diasSemVisita = diffDias;
  return diffDias;
};

module.exports = clienteSchema;
