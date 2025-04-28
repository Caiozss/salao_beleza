const mongoose = require('mongoose');

const produtoSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true
  },
  descricao: {
    type: String,
    trim: true
  },
  categoria: {
    type: String,
    required: true,
    enum: ['Cabelo', 'Unhas', 'Estética', 'Tranças', 'Cílios', 'Sobrancelha', 'Limpeza', 'Outros']
  },
  marca: {
    type: String,
    trim: true
  },
  quantidadeEstoque: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  unidadeMedida: {
    type: String,
    enum: ['unidade', 'ml', 'g', 'kg', 'l', 'caixa', 'pacote'],
    default: 'unidade'
  },
  nivelMinimoEstoque: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  precoCompra: {
    type: Number,
    min: 0
  },
  precoVenda: {
    type: Number,
    min: 0
  },
  disponibilidadeVenda: {
    type: Boolean,
    default: false
  },
  fornecedor: {
    nome: String,
    contato: String,
    email: String
  },
  codigoBarras: {
    type: String
  },
  imagem: {
    type: String
  },
  dataValidade: {
    type: Date
  },
  historicoMovimentacao: [{
    tipo: {
      type: String,
      enum: ['entrada', 'saida', 'ajuste'],
      required: true
    },
    quantidade: {
      type: Number,
      required: true
    },
    motivo: {
      type: String,
      required: true
    },
    agendamento: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agendamento'
    },
    data: {
      type: Date,
      default: Date.now
    },
    responsavel: {
      type: String
    }
  }],
  ativo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Método para verificar se o estoque está baixo
produtoSchema.methods.estoqueEstaBaixo = function() {
  return this.quantidadeEstoque <= this.nivelMinimoEstoque;
};

// Método para atualizar o estoque
produtoSchema.methods.atualizarEstoque = function(quantidade, tipo, motivo, agendamento, responsavel) {
  const movimentacao = {
    tipo,
    quantidade,
    motivo,
    data: new Date(),
    responsavel
  };
  
  if (agendamento) {
    movimentacao.agendamento = agendamento;
  }
  
  this.historicoMovimentacao.push(movimentacao);
  
  if (tipo === 'entrada') {
    this.quantidadeEstoque += quantidade;
  } else if (tipo === 'saida') {
    this.quantidadeEstoque = Math.max(0, this.quantidadeEstoque - quantidade);
  } else if (tipo === 'ajuste') {
    this.quantidadeEstoque = quantidade;
  }
  
  return this.save();
};

module.exports = produtoSchema;
