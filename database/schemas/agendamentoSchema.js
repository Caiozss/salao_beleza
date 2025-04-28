const mongoose = require('mongoose');

const agendamentoSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  },
  profissional: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profissional',
    required: true
  },
  servico: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Servico',
    required: true
  },
  dataHora: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['agendado', 'confirmado', 'concluido', 'cancelado'],
    default: 'agendado'
  },
  valorTotal: {
    type: Number,
    required: true
  },
  observacoes: {
    type: String
  },
  notificacoes: [{
    tipo: {
      type: String,
      enum: ['confirmacao', 'lembrete', 'cancelamento']
    },
    dataEnvio: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['enviado', 'falha', 'pendente'],
      default: 'pendente'
    }
  }],
  avaliacao: {
    nota: {
      type: Number,
      min: 1,
      max: 5
    },
    comentario: {
      type: String
    },
    dataAvaliacao: {
      type: Date
    }
  },
  produtosUtilizados: [{
    produto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produto'
    },
    quantidade: {
      type: Number,
      default: 1
    }
  }]
}, {
  timestamps: true
});

// Índices para melhorar a performance de consultas
agendamentoSchema.index({ dataHora: 1 });
agendamentoSchema.index({ cliente: 1 });
agendamentoSchema.index({ profissional: 1, dataHora: 1 });
agendamentoSchema.index({ status: 1 });

module.exports = agendamentoSchema;
