const mongoose = require('mongoose');

const lembreteSchema = new mongoose.Schema({
  tipo: {
    type: String,
    required: true,
    enum: ['limpeza', 'manutencao', 'estoque', 'cliente', 'outro']
  },
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  descricao: {
    type: String,
    trim: true
  },
  frequencia: {
    tipo: {
      type: String,
      enum: ['diario', 'semanal', 'mensal', 'personalizado', 'unico'],
      default: 'unico'
    },
    diasSemana: {
      type: [Number], // 0 = Domingo, 1 = Segunda, etc.
      default: []
    },
    intervalo: {
      type: Number, // Intervalo em dias para frequência personalizada
      default: 1
    }
  },
  dataProximaExecucao: {
    type: Date,
    required: true
  },
  prioridade: {
    type: String,
    enum: ['baixa', 'media', 'alta'],
    default: 'media'
  },
  status: {
    type: String,
    enum: ['pendente', 'concluido', 'atrasado', 'cancelado'],
    default: 'pendente'
  },
  notificacoes: {
    antecedencia: {
      type: Number, // Antecedência em horas
      default: 24
    },
    enviarEmail: {
      type: Boolean,
      default: true
    },
    enviarPush: {
      type: Boolean,
      default: true
    }
  },
  responsavel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profissional'
  },
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente'
  },
  produto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produto'
  },
  historicoExecucoes: [{
    dataExecucao: {
      type: Date,
      default: Date.now
    },
    observacoes: {
      type: String
    },
    executor: {
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

// Método para marcar como concluído
lembreteSchema.methods.marcarConcluido = function(observacoes, executor) {
  this.status = 'concluido';
  
  this.historicoExecucoes.push({
    dataExecucao: new Date(),
    observacoes,
    executor
  });
  
  // Calcular próxima data de execução baseada na frequência
  if (this.frequencia.tipo !== 'unico') {
    let proximaData = new Date();
    
    switch (this.frequencia.tipo) {
      case 'diario':
        proximaData.setDate(proximaData.getDate() + 1);
        break;
      case 'semanal':
        proximaData.setDate(proximaData.getDate() + 7);
        break;
      case 'mensal':
        proximaData.setMonth(proximaData.getMonth() + 1);
        break;
      case 'personalizado':
        proximaData.setDate(proximaData.getDate() + this.frequencia.intervalo);
        break;
    }
    
    this.dataProximaExecucao = proximaData;
    this.status = 'pendente';
  }
  
  return this.save();
};

// Método para verificar se está atrasado
lembreteSchema.methods.verificarAtraso = function() {
  const hoje = new Date();
  if (this.status === 'pendente' && this.dataProximaExecucao < hoje) {
    this.status = 'atrasado';
    return true;
  }
  return false;
};

module.exports = lembreteSchema;
