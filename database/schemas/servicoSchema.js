const mongoose = require('mongoose');

const servicoSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true
  },
  descricao: {
    type: String,
    trim: true
  },
  duracao: {
    type: Number, // duração em minutos
    required: true,
    min: 15
  },
  preco: {
    type: Number,
    required: true,
    min: 0
  },
  categoria: {
    type: String,
    required: true,
    enum: ['Cabelo', 'Unhas', 'Estética', 'Tranças', 'Cílios', 'Sobrancelha']
  },
  profissionaisHabilitados: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profissional'
  }],
  produtosUtilizados: [{
    produto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produto'
    },
    quantidade: {
      type: Number,
      default: 1
    }
  }],
  imagem: {
    type: String
  },
  destaque: {
    type: Boolean,
    default: false
  },
  ativo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = servicoSchema;
