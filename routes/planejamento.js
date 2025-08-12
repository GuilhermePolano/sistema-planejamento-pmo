const express = require('express');
const router = express.Router();
const moment = require('moment');
const fs = require('fs');
const path = require('path');

// Função para verificar se MongoDB está disponível
function isMongoDBAvailable() {
    try {
        const mongoose = require('mongoose');
        return mongoose.connection.readyState === 1;
    } catch (error) {
        return false;
    }
}

// Função para carregar dados do JSON
function loadPlanningData() {
    try {
        const jsonPath = path.join(__dirname, '../data/planning-data.json');
        if (fs.existsSync(jsonPath)) {
            const data = fs.readFileSync(jsonPath, 'utf-8');
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        console.error('Erro ao carregar dados do JSON:', error);
        return [];
    }
}

// Função para salvar dados no JSON
function savePlanningData(data) {
    try {
        const jsonPath = path.join(__dirname, '../data/planning-data.json');
        const dir = path.dirname(jsonPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Erro ao salvar dados no JSON:', error);
        return false;
    }
}

// Função auxiliar para gerar semanas
function gerarSemanas(dataInicio, numSemanas = 4) {
    const semanas = [];
    const inicio = moment(dataInicio);
    
    for (let i = 0; i < numSemanas; i++) {
        const inicioSemana = inicio.clone().add(i, 'weeks').startOf('week');
        const fimSemana = inicioSemana.clone().endOf('week');
        
        // Gerar dias da semana
        const dias = [];
        for (let j = 0; j < 7; j++) {
            const dia = inicioSemana.clone().add(j, 'days');
            dias.push({
                data: dia.toDate(),
                tarefas: []
            });
        }
        
        semanas.push({
            numero: i + 1,
            dataInicio: inicioSemana.toDate(),
            dataFim: fimSemana.toDate(),
            dias: dias,
            tarefas: [],
            metricas: {
                totalTarefas: 0,
                horasEstimadas: 0,
                progresso: 0
            }
        });
    }
    
    return semanas;
}

// GET - Buscar planejamento por período
router.get('/', async (req, res) => {
    try {
        const { dataInicio, numSemanas } = req.query;
        
        if (!dataInicio) {
            return res.status(400).json({
                success: false,
                message: 'Data de início é obrigatória'
            });
        }
        
        if (isMongoDBAvailable()) {
            // Usar MongoDB se disponível
            const PlanejamentoSemanal = require('../models/PlanejamentoSemanal');
            const planejamento = await PlanejamentoSemanal.findOne({
                dataInicio: { $lte: new Date(dataInicio) },
                dataFim: { $gte: moment(dataInicio).add(parseInt(numSemanas || 4), 'weeks').toDate() }
            });
            
            if (planejamento) {
                return res.json(planejamento);
            }
        } else {
            // Usar JSON como fallback
            const planejamentos = loadPlanningData();
            const dataInicioDate = new Date(dataInicio);
            const dataFimDate = moment(dataInicio).add(parseInt(numSemanas || 4), 'weeks').toDate();
            
            const planejamento = planejamentos.find(p => {
                const pInicio = new Date(p.dataInicio);
                const pFim = new Date(p.dataFim);
                return pInicio <= dataFimDate && pFim >= dataInicioDate;
            });
            
            if (planejamento) {
                return res.json(planejamento);
            }
        }
        
        // Se não encontrou, retornar 404 para criar novo
        return res.status(404).json({
            success: false,
            message: 'Planejamento não encontrado'
        });
        
    } catch (error) {
        console.error('Erro ao buscar planejamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// GET - Buscar planejamento por ID
router.get('/:id', async (req, res) => {
    try {
        if (isMongoDBAvailable()) {
            const PlanejamentoSemanal = require('../models/PlanejamentoSemanal');
            const planejamento = await PlanejamentoSemanal.findById(req.params.id);
            
            if (!planejamento) {
                return res.status(404).json({
                    success: false,
                    message: 'Planejamento não encontrado'
                });
            }
            
            res.json(planejamento);
        } else {
            // Usar JSON como fallback
            const planejamentos = loadPlanningData();
            const planejamento = planejamentos.find(p => p.id === req.params.id);
            
            if (!planejamento) {
                return res.status(404).json({
                    success: false,
                    message: 'Planejamento não encontrado'
                });
            }
            
            res.json(planejamento);
        }
    } catch (error) {
        console.error('Erro ao buscar planejamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// POST - Criar novo planejamento
router.post('/', async (req, res) => {
    try {
        const { dataInicio, numSemanas = 4 } = req.body;
        
        if (!dataInicio) {
            return res.status(400).json({
                success: false,
                message: 'Data de início é obrigatória'
            });
        }
        
        const semanas = gerarSemanas(dataInicio, numSemanas);
        const planejamentoData = {
            id: Date.now().toString(),
            dataInicio: new Date(dataInicio),
            dataFim: moment(dataInicio).add(numSemanas, 'weeks').endOf('week').toDate(),
            semanas: semanas,
            criadoPor: req.body.criadoPor || 'Sistema',
            criadoEm: new Date(),
            atualizadoEm: new Date()
        };
        
        if (isMongoDBAvailable()) {
            // Usar MongoDB se disponível
            const PlanejamentoSemanal = require('../models/PlanejamentoSemanal');
            const planejamento = new PlanejamentoSemanal(planejamentoData);
            const saved = await planejamento.save();
            res.status(201).json(saved);
        } else {
            // Usar JSON como fallback
            const planejamentos = loadPlanningData();
            planejamentos.push(planejamentoData);
            savePlanningData(planejamentos);
            res.status(201).json(planejamentoData);
        }
    } catch (error) {
        console.error('Erro ao criar planejamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// POST - Criar nova tarefa
router.post('/tarefas', async (req, res) => {
    try {
        const tarefaData = req.body;
        
        // Gerar ID único para a tarefa
        const novaTarefa = {
            id: Date.now().toString(),
            ...tarefaData,
            criadoEm: new Date(),
            atualizadoEm: new Date()
        };
        
        res.status(201).json(novaTarefa);
    } catch (error) {
        console.error('Erro ao criar tarefa:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// PUT - Atualizar planejamento
router.put('/:id', async (req, res) => {
    try {
        if (isMongoDBAvailable()) {
            const PlanejamentoSemanal = require('../models/PlanejamentoSemanal');
            const planejamento = await PlanejamentoSemanal.findById(req.params.id);
            if (!planejamento) {
                return res.status(404).json({
                    success: false,
                    message: 'Planejamento não encontrado'
                });
            }
            
            Object.assign(planejamento, req.body);
            planejamento.atualizadoEm = new Date();
            await planejamento.save();
            res.json(planejamento);
        } else {
            // Usar JSON como fallback
            const planejamentos = loadPlanningData();
            const index = planejamentos.findIndex(p => p.id === req.params.id);
            
            if (index === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Planejamento não encontrado'
                });
            }
            
            Object.assign(planejamentos[index], req.body);
            planejamentos[index].atualizadoEm = new Date();
            savePlanningData(planejamentos);
            res.json(planejamentos[index]);
        }
    } catch (error) {
        console.error('Erro ao atualizar planejamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// PUT - Mover tarefa
router.put('/:id/tarefas/:taskId/mover', async (req, res) => {
    try {
        const { novaSemana, novoDia } = req.body;
        
        if (isMongoDBAvailable()) {
            const PlanejamentoSemanal = require('../models/PlanejamentoSemanal');
            const planejamento = await PlanejamentoSemanal.findById(req.params.id);
            
            if (!planejamento) {
                return res.status(404).json({
                    success: false,
                    message: 'Planejamento não encontrado'
                });
            }
            
            // Encontrar tarefa em todas as semanas
            let tarefa = null;
            let semanaOrigem = null;
            let diaOrigem = null;
            
            for (let i = 0; i < planejamento.semanas.length; i++) {
                for (let j = 0; j < planejamento.semanas[i].dias.length; j++) {
                    const tarefaIndex = planejamento.semanas[i].dias[j].tarefas.findIndex(t => t.id === req.params.taskId);
                    if (tarefaIndex !== -1) {
                        tarefa = planejamento.semanas[i].dias[j].tarefas[tarefaIndex];
                        semanaOrigem = i;
                        diaOrigem = j;
                        break;
                    }
                }
                if (tarefa) break;
            }
            
            if (!tarefa) {
                return res.status(404).json({
                    success: false,
                    message: 'Tarefa não encontrada'
                });
            }
            
            // Remover da posição original
            planejamento.semanas[semanaOrigem].dias[diaOrigem].tarefas = 
                planejamento.semanas[semanaOrigem].dias[diaOrigem].tarefas.filter(t => t.id !== req.params.taskId);
            
            // Adicionar na nova posição
            if (planejamento.semanas[novaSemana] && planejamento.semanas[novaSemana].dias[novoDia]) {
                planejamento.semanas[novaSemana].dias[novoDia].tarefas.push(tarefa);
            }
            
            await planejamento.save();
            res.json(planejamento);
        } else {
            // Usar JSON como fallback
            const planejamentos = loadPlanningData();
            const planejamento = planejamentos.find(p => p.id === req.params.id);
            
            if (!planejamento) {
                return res.status(404).json({
                    success: false,
                    message: 'Planejamento não encontrado'
                });
            }
            
            // Implementar lógica de mover tarefa para JSON
            // Por enquanto, retornar o planejamento atual
            res.json(planejamento);
        }
    } catch (error) {
        console.error('Erro ao mover tarefa:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// POST - Importar tarefas
router.post('/:id/importar-tarefas', async (req, res) => {
    try {
        const { semanaIndex, tarefasIds } = req.body;
        
        if (isMongoDBAvailable()) {
            const PlanejamentoSemanal = require('../models/PlanejamentoSemanal');
            const planejamento = await PlanejamentoSemanal.findById(req.params.id);
            
            if (!planejamento) {
                return res.status(404).json({
                    success: false,
                    message: 'Planejamento não encontrado'
                });
            }
            
            res.json(planejamento);
        } else {
            // Usar JSON como fallback
            const planejamentos = loadPlanningData();
            const planejamento = planejamentos.find(p => p.id === req.params.id);
            
            if (!planejamento) {
                return res.status(404).json({
                    success: false,
                    message: 'Planejamento não encontrado'
                });
            }
            
            res.json(planejamento);
        }
    } catch (error) {
        console.error('Erro ao importar tarefas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// DELETE - Remover planejamento
router.delete('/:id', async (req, res) => {
    try {
        if (isMongoDBAvailable()) {
            const PlanejamentoSemanal = require('../models/PlanejamentoSemanal');
            const planejamento = await PlanejamentoSemanal.findByIdAndDelete(req.params.id);
            
            if (!planejamento) {
                return res.status(404).json({
                    success: false,
                    message: 'Planejamento não encontrado'
                });
            }
        } else {
            // Usar JSON como fallback
            const planejamentos = loadPlanningData();
            const index = planejamentos.findIndex(p => p.id === req.params.id);
            
            if (index === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Planejamento não encontrado'
                });
            }
            
            planejamentos.splice(index, 1);
            savePlanningData(planejamentos);
        }
        
        res.json({
            success: true,
            message: 'Planejamento removido com sucesso'
        });
    } catch (error) {
        console.error('Erro ao remover planejamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

module.exports = router;
