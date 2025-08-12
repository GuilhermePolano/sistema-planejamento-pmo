const mongoose = require('mongoose');

const sustentacaoSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    po: {
        type: String,
        required: true
    },
    squad: {
        type: String,
        required: true,
        index: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Ativa', 'Inativa', 'Pausada'],
        default: 'Ativa'
    },
    dataInicio: {
        type: Date,
        required: true
    },
    dataFim: {
        type: Date,
        required: true
    },
    tarefas: {
        type: Number,
        default: 0
    },
    analistas: [{
        type: String
    }],
    tarefasDetalhadas: [{
        titulo: String,
        analista: String,
        status: String,
        inicio: Date,
        fim: Date,
        descricao: String
    }],
    descricao: String,
    observacoes: String
}, {
    timestamps: true
});

// Índices para melhor performance
sustentacaoSchema.index({ status: 1, dataFim: 1 });
sustentacaoSchema.index({ squad: 1, status: 1 });
sustentacaoSchema.index({ dataInicio: 1, dataFim: 1 });

// Método para calcular duração da sustentação
sustentacaoSchema.methods.calcularDuracao = function() {
    const inicio = new Date(this.dataInicio);
    const fim = new Date(this.dataFim);
    const diffTime = Math.abs(fim - inicio);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Método para verificar se está ativa
sustentacaoSchema.methods.isAtiva = function() {
    const hoje = new Date();
    return this.status === 'Ativa' && this.dataFim >= hoje;
};

module.exports = mongoose.model('Sustentacao', sustentacaoSchema);
