const mongoose = require('mongoose');

const tarefaSchema = new mongoose.Schema({
    // Coluna A - Nome do projeto
    nomeProjeto: {
        type: String,
        required: true,
        index: true
    },
    
    // Coluna B - Nome da tarefa dentro do projeto
    nomeTarefa: {
        type: String,
        required: true
    },
    
    // Coluna C - Tipo de Item
    tipoItem: {
        type: String,
        required: true
    },
    
    // Coluna D - Chave do projeto no JIRA
    chaveJira: {
        type: String,
        required: true,
        unique: true
    },
    
    // Coluna E - Analista Técnico responsável
    analistaTecnico: {
        type: String,
        required: true,
        index: true
    },
    
    // Coluna F - Analista de Negócio
    analistaNegocio: {
        type: String,
        required: true
    },
    
    // Coluna G - Data de início prevista
    dataInicioPrevista: {
        type: Date,
        required: true
    },
    
    // Coluna H - Data de fim prevista
    dataFimPrevista: {
        type: Date,
        required: true
    },
    
    // Coluna I - Status da tarefa
    status: {
        type: String,
        required: true,
        enum: ['Backlog', 'Em Análise', 'Em Desenvolvimento', 'Pronto para Teste', 'Em Homologação', 'Produção', 'Concluída'],
        default: 'Backlog'
    },
    
    // Coluna J - Squad do analista técnico
    squad: {
        type: String,
        required: true,
        index: true
    },
    
    // Coluna K - Categoria (PO ou tecnologia)
    categoria: {
        type: String,
        required: true,
        index: true
    },
    
    // Coluna L - Demanda atrasada (calculado)
    atrasada: {
        type: Boolean,
        default: false
    },
    
    // Coluna M - Demanda deste mês, anterior ou posterior (calculado)
    periodoDemanda: {
        type: String,
        enum: ['mes_atual', 'mes_anterior', 'mes_posterior'],
        default: 'mes_atual'
    },
    
    // Coluna N - Tipo de demanda (sustentação ou projeto)
    tipoDemanda: {
        type: String,
        enum: ['sustentacao', 'projeto'],
        default: 'projeto'
    },
    
    // Campos adicionais para melhor organização
    dataCriacao: {
        type: Date,
        default: Date.now
    },
    
    dataAtualizacao: {
        type: Date,
        default: Date.now
    },
    
    observacoes: {
        type: String
    }
}, {
    timestamps: true
});

// Índices para melhor performance
tarefaSchema.index({ nomeProjeto: 1, analistaTecnico: 1 });
tarefaSchema.index({ status: 1, dataFimPrevista: 1 });
tarefaSchema.index({ squad: 1, categoria: 1 });

// Middleware para calcular campos derivados
tarefaSchema.pre('save', function(next) {
    const hoje = new Date();
    
    // Calcular se está atrasada
    this.atrasada = this.dataFimPrevista < hoje && this.status !== 'Produção' && this.status !== 'Concluída';
    
    // Calcular período da demanda
    const mesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const mesProximo = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);
    const mesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    
    if (this.dataFimPrevista >= mesAtual && this.dataFimPrevista < mesProximo) {
        this.periodoDemanda = 'mes_atual';
    } else if (this.dataFimPrevista < mesAtual) {
        this.periodoDemanda = 'mes_anterior';
    } else {
        this.periodoDemanda = 'mes_posterior';
    }
    
    // Determinar tipo de demanda baseado no nome do projeto
    if (this.nomeProjeto.toLowerCase().includes('sustentação') || 
        this.nomeProjeto.toLowerCase().includes('sustentacao')) {
        this.tipoDemanda = 'sustentacao';
    } else {
        this.tipoDemanda = 'projeto';
    }
    
    this.dataAtualizacao = new Date();
    next();
});

module.exports = mongoose.model('Tarefa', tarefaSchema); 