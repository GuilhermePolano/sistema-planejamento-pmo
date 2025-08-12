const mongoose = require('mongoose');

const analistaSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    categoria: {
        type: String,
        required: true,
        index: true
    },
    squad: {
        type: String,
        required: true,
        index: true
    },
    stacks: [{
        type: String
    }],
    funcoes: [{
        type: String
    }],
    dataFinalUltimaTarefa: {
        type: Date,
        required: true
    },
    tarefasAtivas: {
        type: Number,
        default: 0
    },
    projetos: [{
        type: String
    }],
    disponibilidade: {
        type: Number,
        default: 40 // horas por semana
    },
    cargaAtual: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Índices para melhor performance
analistaSchema.index({ categoria: 1, squad: 1 });
analistaSchema.index({ dataFinalUltimaTarefa: 1 });
analistaSchema.index({ 'stacks': 1 });

// Método para verificar se está disponível
analistaSchema.methods.isAvailable = function() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataFinal = new Date(this.dataFinalUltimaTarefa);
    dataFinal.setHours(0, 0, 0, 0);
    return dataFinal <= hoje;
};

// Método para calcular dias até disponibilidade
analistaSchema.methods.diasAteDisponibilidade = function() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataFinal = new Date(this.dataFinalUltimaTarefa);
    dataFinal.setHours(0, 0, 0, 0);
    const diffTime = dataFinal - hoje;
    const dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return dias > 0 ? dias : 0;
};

module.exports = mongoose.model('Analista', analistaSchema); 