const mongoose = require('mongoose');

const profissionalSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true
  },
  telefone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  especialidades: {
    type: [String],
    required: true,
    enum: ['Cabelereiro', 'Manicure', 'Pedicure', 'Estética', 'Tranças', 'Alongamento de cílios', 'Alongamento de unhas', 'Sobrancelha']
  },
  horariosTrabalho: [{
    diaSemana: {
      type: Number, // 0 = Domingo, 1 = Segunda, etc.
      required: true
    },
    horaInicio: {
      type: String,
      required: true
    },
    horaFim: {
      type: String,
      required: true
    }
  }],
  ativo: {
    type: Boolean,
    default: true
  },
  foto: {
    type: String
  },
  comissao: {
    type: Number,
    default: 0
  },
  observacoes: {
    type: String
  },
  dataCadastro: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = profissionalSchema;
