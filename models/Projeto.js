const mongoose = require('mongoose');

const projetoSchema = new mongoose.Schema({
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
        enum: ['Em Andamento', 'Concluído', 'Pausado', 'Cancelado', 'Produção'],
        default: 'Em Andamento'
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
projetoSchema.index({ status: 1, dataFim: 1 });
projetoSchema.index({ squad: 1, status: 1 });
projetoSchema.index({ dataInicio: 1, dataFim: 1 });

// Método para calcular duração do projeto
projetoSchema.methods.calcularDuracao = function() {
    const inicio = new Date(this.dataInicio);
    const fim = new Date(this.dataFim);
    const diffTime = Math.abs(fim - inicio);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Método para verificar se está atrasado
projetoSchema.methods.isAtrasado = function() {
    const hoje = new Date();
    return this.dataFim < hoje && this.status !== 'Concluído' && this.status !== 'Produção';
};

module.exports = mongoose.model('Projeto', projetoSchema); 