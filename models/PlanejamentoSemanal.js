const mongoose = require('mongoose');

const planejamentoSemanalSchema = new mongoose.Schema({
    dataInicio: {
        type: Date,
        required: true
    },
    dataFim: {
        type: Date,
        required: true
    },
    semanas: [{
        numero: {
            type: Number,
            required: true
        },
        dataInicio: {
            type: Date,
            required: true
        },
        dataFim: {
            type: Date,
            required: true
        },
        dias: [{
            data: {
                type: Date,
                required: true
            },
            tarefas: [{
                id: {
                    type: String,
                    required: true
                },
                titulo: {
                    type: String,
                    required: true
                },
                descricao: String,
                analista: {
                    type: String,
                    required: true
                },
                projeto: String,
                categoria: String,
                squad: String,
                prioridade: {
                    type: String,
                    enum: ['Baixa', 'Média', 'Alta', 'Crítica'],
                    default: 'Média'
                },
                status: {
                    type: String,
                    enum: ['Backlog', 'Em Análise', 'Em Desenvolvimento', 'Em Teste', 'Concluída', 'Bloqueada'],
                    default: 'Backlog'
                },
                horasEstimadas: {
                    type: Number,
                    default: 8
                },
                horasRealizadas: {
                    type: Number,
                    default: 0
                },
                dataInicio: Date,
                dataFim: Date,
                observacoes: String,
                dependencias: [String],
                tags: [String],
                progresso: {
                    type: Number,
                    default: 0
                },
                criadoEm: {
                    type: Date,
                    default: Date.now
                },
                atualizadoEm: {
                    type: Date,
                    default: Date.now
                }
            }]
        }],
        metricas: {
            totalTarefas: {
                type: Number,
                default: 0
            },
            horasEstimadas: {
                type: Number,
                default: 0
            },
            progresso: {
                type: Number,
                default: 0
            }
        }
    }],
    analistas: [{
        nome: {
            type: String,
            required: true
        },
        funcao: {
            type: String,
            enum: ['Analista de Negócio', 'Analista Técnico', 'Responsável Técnico'],
            required: true
        },
        categoria: String,
        squad: String,
        disponibilidade: {
            type: Number,
            default: 40 // horas por semana
        },
        cargaAtual: {
            type: Number,
            default: 0
        }
    }],
    configuracoes: {
        horasPorDia: {
            type: Number,
            default: 8
        },
        diasPorSemana: {
            type: Number,
            default: 5
        },
        feriados: [Date],
        permissoes: {
            podeEditar: [String], // IDs dos usuários que podem editar
            podeVisualizar: [String] // IDs dos usuários que podem visualizar
        }
    },
    metricas: {
        totalTarefas: {
            type: Number,
            default: 0
        },
        tarefasConcluidas: {
            type: Number,
            default: 0
        },
        tarefasEmAndamento: {
            type: Number,
            default: 0
        },
        tarefasBloqueadas: {
            type: Number,
            default: 0
        },
        capacidadeUtilizada: {
            type: Number,
            default: 0
        },
        capacidadeTotal: {
            type: Number,
            default: 0
        }
    },
    criadoPor: {
        type: String,
        required: true
    },
    criadoEm: {
        type: Date,
        default: Date.now
    },
    atualizadoEm: {
        type: Date,
        default: Date.now
    },
    versao: {
        type: Number,
        default: 1
    }
});

// Índices para melhor performance
planejamentoSemanalSchema.index({ dataInicio: 1, dataFim: 1 });
planejamentoSemanalSchema.index({ 'semanas.dias.tarefas.analista': 1 });
planejamentoSemanalSchema.index({ 'semanas.dias.tarefas.projeto': 1 });
planejamentoSemanalSchema.index({ 'semanas.dias.tarefas.status': 1 });

// Middleware para atualizar timestamp
planejamentoSemanalSchema.pre('save', function(next) {
    this.atualizadoEm = new Date();
    this.versao += 1;
    this.calcularMetricas();
    next();
});

// Método para calcular métricas
planejamentoSemanalSchema.methods.calcularMetricas = function() {
    let totalTarefas = 0;
    let tarefasConcluidas = 0;
    let tarefasEmAndamento = 0;
    let tarefasBloqueadas = 0;
    let horasEstimadas = 0;
    
    // Calcular métricas por semana
    this.semanas.forEach(semana => {
        let semanaTarefas = 0;
        let semanaHoras = 0;
        let semanaProgresso = 0;
        
        semana.dias.forEach(dia => {
            dia.tarefas.forEach(tarefa => {
                totalTarefas++;
                semanaTarefas++;
                horasEstimadas += tarefa.horasEstimadas || 0;
                semanaHoras += tarefa.horasEstimadas || 0;
                semanaProgresso += tarefa.progresso || 0;
                
                if (tarefa.status === 'Concluída') {
                    tarefasConcluidas++;
                } else if (['Em Análise', 'Em Desenvolvimento', 'Em Teste'].includes(tarefa.status)) {
                    tarefasEmAndamento++;
                } else if (tarefa.status === 'Bloqueada') {
                    tarefasBloqueadas++;
                }
            });
        });
        
        // Atualizar métricas da semana
        semana.metricas = {
            totalTarefas: semanaTarefas,
            horasEstimadas: semanaHoras,
            progresso: semanaTarefas > 0 ? Math.round(semanaProgresso / semanaTarefas) : 0
        };
    });
    
    const capacidadeTotal = this.analistas.reduce((total, a) => total + a.disponibilidade, 0);
    const capacidadeUtilizada = this.analistas.reduce((total, a) => total + a.cargaAtual, 0);
    
    this.metricas = {
        totalTarefas,
        tarefasConcluidas,
        tarefasEmAndamento,
        tarefasBloqueadas,
        capacidadeUtilizada,
        capacidadeTotal
    };
    
    return this.metricas;
};

// Método para adicionar tarefa
planejamentoSemanalSchema.methods.adicionarTarefa = function(tarefa) {
    tarefa.id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    tarefa.criadoEm = new Date();
    tarefa.atualizadoEm = new Date();
    
    // Encontrar semana e dia apropriados
    const dataInicio = new Date(tarefa.dataInicio);
    const dataFim = new Date(tarefa.dataFim);
    
    this.semanas.forEach(semana => {
        const semanaStart = new Date(semana.dataInicio);
        const semanaEnd = new Date(semana.dataFim);
        
        if (dataInicio >= semanaStart && dataInicio <= semanaEnd) {
            const dayOfWeek = dataInicio.getDay();
            const diaIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Converter domingo=0 para domingo=6
            
            if (semana.dias[diaIndex]) {
                semana.dias[diaIndex].tarefas.push(tarefa);
            }
        }
    });
    
    this.calcularMetricas();
    return tarefa;
};

// Método para mover tarefa
planejamentoSemanalSchema.methods.moverTarefa = function(tarefaId, novaSemana, novoDia) {
    let tarefa = null;
    let semanaOrigem = null;
    let diaOrigem = null;
    
    // Encontrar tarefa
    for (let i = 0; i < this.semanas.length; i++) {
        for (let j = 0; j < this.semanas[i].dias.length; j++) {
            const tarefaIndex = this.semanas[i].dias[j].tarefas.findIndex(t => t.id === tarefaId);
            if (tarefaIndex !== -1) {
                tarefa = this.semanas[i].dias[j].tarefas[tarefaIndex];
                semanaOrigem = i;
                diaOrigem = j;
                break;
            }
        }
        if (tarefa) break;
    }
    
    if (tarefa && this.semanas[novaSemana] && this.semanas[novaSemana].dias[novoDia]) {
        // Remover da posição original
        this.semanas[semanaOrigem].dias[diaOrigem].tarefas = 
            this.semanas[semanaOrigem].dias[diaOrigem].tarefas.filter(t => t.id !== tarefaId);
        
        // Adicionar na nova posição
        this.semanas[novaSemana].dias[novoDia].tarefas.push(tarefa);
        
        tarefa.atualizadoEm = new Date();
        this.calcularMetricas();
        return tarefa;
    }
    
    return null;
};

// Método para atualizar status da tarefa
planejamentoSemanalSchema.methods.atualizarStatusTarefa = function(tarefaId, novoStatus) {
    for (const semana of this.semanas) {
        for (const dia of semana.dias) {
            const tarefa = dia.tarefas.find(t => t.id === tarefaId);
            if (tarefa) {
                tarefa.status = novoStatus;
                tarefa.atualizadoEm = new Date();
                this.calcularMetricas();
                return tarefa;
            }
        }
    }
    return null;
};

// Método estático para buscar por período
planejamentoSemanalSchema.statics.buscarPorPeriodo = function(dataInicio, dataFim) {
    return this.find({
        dataInicio: { $lte: dataFim },
        dataFim: { $gte: dataInicio }
    }).sort({ dataInicio: 1 });
};

// Método estático para buscar por analista
planejamentoSemanalSchema.statics.buscarPorAnalista = function(nomeAnalista) {
    return this.find({
        'semanas.dias.tarefas.analista': nomeAnalista
    }).sort({ dataInicio: 1 });
};

// Método estático para buscar por projeto
planejamentoSemanalSchema.statics.buscarPorProjeto = function(nomeProjeto) {
    return this.find({
        'semanas.dias.tarefas.projeto': nomeProjeto
    }).sort({ dataInicio: 1 });
};

module.exports = mongoose.model('PlanejamentoSemanal', planejamentoSemanalSchema);
