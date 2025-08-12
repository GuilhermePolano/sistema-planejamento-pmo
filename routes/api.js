const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ExcelProcessor = require('../services/excelProcessor');

const router = express.Router();

// Função para ler dados do arquivo JSON
function getDashboardData() {
    try {
        const jsonPath = path.join(__dirname, '../data/dashboard-data.json');
        if (!fs.existsSync(jsonPath)) {
            return null;
        }
        const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
        return JSON.parse(jsonContent);
    } catch (error) {
        console.error('Erro ao ler dados do JSON:', error);
        return null;
    }
}

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = './uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'excel-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel', // .xls
            'text/csv' // .csv
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo não suportado. Use arquivos Excel (.xlsx, .xls) ou CSV.'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

// Rota para upload e processamento de arquivo Excel
router.post('/upload-excel', upload.single('excelFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: 'Nenhum arquivo foi enviado' 
            });
        }

        console.log(`Arquivo recebido: ${req.file.originalname}`);

        const processor = new ExcelProcessor();
        
        // Processar o arquivo enviado
        const processedData = await processor.processExcelFile(req.file.path);
        
        // Armazenar os dados processados para salvar depois
        processor.lastProcessedData = processedData;
        
        // Salvar no arquivo JSON
        const saveResult = await processor.saveToDatabase();

        // Remove o arquivo temporário
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            message: 'Arquivo processado com sucesso!',
            data: {
                arquivo: req.file.originalname,
                processados: saveResult,
                resumo: {
                    totalTarefas: processedData.tarefas.length,
                    totalProjetos: processedData.projetos.length,
                    totalAnalistas: processedData.analistas.length
                }
            }
        });

    } catch (error) {
        console.error('Erro no upload:', error);
        
        // Remove arquivo em caso de erro
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            message: 'Erro ao processar arquivo',
            error: error.message
        });
    }
});

// Rota para obter dados do dashboard
router.get('/dashboard-data', async (req, res) => {
    try {
        const dashboardData = getDashboardData();
        
        if (!dashboardData) {
            return res.status(404).json({
                success: false,
                message: 'Dados não encontrados. Execute o processamento primeiro.'
            });
        }

        res.json({
            success: true,
            data: dashboardData
        });

    } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar dados',
            error: error.message
        });
    }
});

// Rota para obter estatísticas
router.get('/stats', async (req, res) => {
    try {
        const dashboardData = getDashboardData();
        
        if (!dashboardData) {
            return res.status(404).json({
                success: false,
                message: 'Dados não encontrados. Execute o processamento primeiro.'
            });
        }

        const totalTarefas = dashboardData.tarefas ? dashboardData.tarefas.length : 0;
        const totalProjetos = dashboardData.projetos ? dashboardData.projetos.length : 0;
        const totalAnalistas = dashboardData.analistas ? dashboardData.analistas.length : 0;

        // Calcula analistas disponíveis
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        const analistasDisponiveis = dashboardData.analistas ? 
            dashboardData.analistas.filter(analista => {
                if (!analista.dataFinalUltimaTarefa) return true;
                const dataFinal = new Date(analista.dataFinalUltimaTarefa);
                return dataFinal <= hoje;
            }).length : 0;

        const percentualDisponibilidade = totalAnalistas > 0 
            ? ((analistasDisponiveis / totalAnalistas) * 100).toFixed(1)
            : 0;

        res.json({
            success: true,
            data: {
                totalProjetos,
                totalTarefas,
                totalAnalistas,
                analistasDisponiveis,
                percentualDisponibilidade: `${percentualDisponibilidade}%`
            }
        });

    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar estatísticas',
            error: error.message
        });
    }
});

// Rota para reprocessar dados do CSV
router.get('/reprocess-data', (req, res) => {
    try {
        const ExcelProcessor = require('../services/excelProcessor');
        const processor = new ExcelProcessor();
        const data = processor.processCSV();
        
        res.json({
            success: true,
            message: 'Dados reprocessados com sucesso',
            data: {
                projetos: data.projetos.length,
                analistas: data.analistas.length,
                tarefas: data.tarefas.length,
                categorias: data.categorias.length
            }
        });
    } catch (error) {
        console.error('Erro ao reprocessar dados:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao reprocessar dados',
            error: error.message
        });
    }
});

// Rota para obter analistas
router.get('/analistas', async (req, res) => {
    try {
        // Verificar se MongoDB está disponível
        const mongoose = require('mongoose');
        const isMongoAvailable = mongoose.connection.readyState === 1;
        
        if (isMongoAvailable) {
            // Buscar do MongoDB
            const Analista = require('../models/Analista');
            const analistas = await Analista.find({}).sort({ nome: 1 });
            
            res.json({
                success: true,
                data: analistas
            });
        } else {
            // Fallback para JSON
            const dashboardData = getDashboardData();
            
            if (!dashboardData || !dashboardData.analistas) {
                return res.status(404).json({
                    success: false,
                    message: 'Dados não encontrados'
                });
            }

            // Ordenar analistas em ordem alfabética
            const analistasOrdenados = dashboardData.analistas.sort((a, b) => 
                a.nome.localeCompare(b.nome, 'pt-BR')
            );

            res.json({
                success: true,
                data: analistasOrdenados
            });
        }

    } catch (error) {
        console.error('Erro ao buscar analistas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar analistas',
            error: error.message
        });
    }
});

// Rota para obter projetos
router.get('/projetos', async (req, res) => {
    try {
        // Verificar se MongoDB está disponível
        const mongoose = require('mongoose');
        const isMongoAvailable = mongoose.connection.readyState === 1;
        
        if (isMongoAvailable) {
            // Buscar do MongoDB
            const Projeto = require('../models/Projeto');
            const projetos = await Projeto.find({}).sort({ nome: 1 });
            
            res.json({
                success: true,
                data: projetos
            });
        } else {
            // Fallback para JSON
            const dashboardData = getDashboardData();
            
            if (!dashboardData || !dashboardData.projetos) {
                return res.status(404).json({
                    success: false,
                    message: 'Dados não encontrados'
                });
            }

            res.json({
                success: true,
                data: dashboardData.projetos
            });
        }

    } catch (error) {
        console.error('Erro ao buscar projetos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar projetos',
            error: error.message
        });
    }
});

// Rota para buscar tarefas
router.get('/tarefas', async (req, res) => {
    try {
        const dashboardData = getDashboardData();
        
        if (!dashboardData || !dashboardData.tarefas) {
            return res.status(404).json({
                success: false,
                message: 'Dados não encontrados. Execute o processamento primeiro.'
            });
        }

        const { projeto, analista, status, atrasada, search } = req.query;
        let tarefas = dashboardData.tarefas;

        if (projeto) {
            tarefas = tarefas.filter(t => t.projeto === projeto);
        }
        if (analista) {
            tarefas = tarefas.filter(t => t.responsavel === analista);
        }
        if (status) {
            tarefas = tarefas.filter(t => t.status === status);
        }
        if (atrasada === 'true') {
            tarefas = tarefas.filter(t => t.atrasada === true);
        }
        if (search) {
            tarefas = tarefas.filter(t => 
                (t.projeto && t.projeto.toLowerCase().includes(search.toLowerCase())) ||
                (t.resumo && t.resumo.toLowerCase().includes(search.toLowerCase())) ||
                (t.responsavel && t.responsavel.toLowerCase().includes(search.toLowerCase()))
            );
        }

        // Ordenar por data final e limitar a 100
        tarefas.sort((a, b) => {
            if (!a.dataFinal) return 1;
            if (!b.dataFinal) return -1;
            return new Date(a.dataFinal) - new Date(b.dataFinal);
        });
        
        tarefas = tarefas.slice(0, 100);

        res.json({ success: true, data: tarefas });

    } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar tarefas',
            error: error.message
        });
    }
});

// Rota para obter tarefas dos analistas para planejamento semanal
router.get('/tarefas-analistas', async (req, res) => {
    try {
        // Verificar se MongoDB está disponível
        const mongoose = require('mongoose');
        const isMongoAvailable = mongoose.connection.readyState === 1;
        
        if (isMongoAvailable) {
            // Buscar do MongoDB
            const Tarefa = require('../models/Tarefa');
            
            const tarefas = await Tarefa.find({
                status: { $nin: ['Concluída', 'Produção'] },
                dataFimPrevista: { $gte: new Date() }
            }).sort({ dataInicioPrevista: 1 });

            const tarefasFormatadas = tarefas.map(tarefa => ({
                id: tarefa._id.toString(),
                titulo: tarefa.nomeTarefa,
                descricao: tarefa.observacoes || '',
                analista: tarefa.analistaTecnico,
                projeto: tarefa.nomeProjeto,
                categoria: tarefa.categoria,
                squad: tarefa.squad,
                prioridade: 'Média',
                status: tarefa.status,
                horasEstimadas: 8,
                horasRealizadas: 0,
                dataInicio: tarefa.dataInicioPrevista,
                dataFim: tarefa.dataFimPrevista,
                observacoes: tarefa.observacoes,
                dependencias: [],
                tags: [tarefa.tipoItem, tarefa.categoria],
                progresso: 0,
                criadoEm: tarefa.createdAt,
                atualizadoEm: tarefa.updatedAt
            }));

            res.json({
                success: true,
                data: tarefasFormatadas
            });
        } else {
            // Fallback para JSON
            const dashboardData = getDashboardData();
            
            if (!dashboardData || !dashboardData.tarefas) {
                return res.status(404).json({
                    success: false,
                    message: 'Dados não encontrados'
                });
            }

            const tarefasAtivas = dashboardData.tarefas
                .filter(tarefa => 
                    tarefa.status !== 'Concluída' && 
                    tarefa.status !== 'Produção' &&
                    new Date(tarefa.dataFinal) >= new Date()
                )
                .map(tarefa => ({
                    id: tarefa.chave || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    titulo: tarefa.resumo,
                    descricao: tarefa.observacoes || '',
                    analista: tarefa.responsavel,
                    projeto: tarefa.projeto,
                    categoria: tarefa.categoria,
                    squad: tarefa.squad,
                    prioridade: 'Média',
                    status: tarefa.status,
                    horasEstimadas: 8,
                    horasRealizadas: 0,
                    dataInicio: tarefa.dataInicial,
                    dataFim: tarefa.dataFinal,
                    observacoes: tarefa.observacoes,
                    dependencias: [],
                    tags: [tarefa.tipoItem, tarefa.categoria],
                    progresso: 0,
                    criadoEm: new Date(),
                    atualizadoEm: new Date()
                }));

            res.json({
                success: true,
                data: tarefasAtivas
            });
        }

    } catch (error) {
        console.error('Erro ao buscar tarefas dos analistas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar tarefas',
            error: error.message
        });
    }
});

// GET - Carregar tarefas dos projetos e sustentações para planejamento
router.get('/tarefas-planejamento', async (req, res) => {
    try {
        console.log('🔄 Iniciando carregamento de tarefas para planejamento...');
        
        // Carregar dados do JSON
        const jsonPath = path.join(__dirname, '../data/dashboard-data.json');
        console.log('📁 Caminho do arquivo:', jsonPath);
        
        if (!fs.existsSync(jsonPath)) {
            console.error('❌ Arquivo de dados não encontrado');
            return res.status(404).json({
                success: false,
                message: 'Arquivo de dados não encontrado'
            });
        }

        console.log('📖 Lendo arquivo de dados...');
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        console.log('✅ Arquivo lido com sucesso');
        console.log('📊 Projetos encontrados:', data.projetos ? data.projetos.length : 0);
        console.log('🔧 Sustentações encontradas:', data.sustentacoes ? data.sustentacoes.length : 0);
        
        const tasks = [];

        // Carregar tarefas dos projetos
        if (data.projetos && Array.isArray(data.projetos)) {
            data.projetos.forEach(projeto => {
                if (projeto.tarefasDetalhadas && Array.isArray(projeto.tarefasDetalhadas)) {
                    projeto.tarefasDetalhadas.forEach(tarefa => {
                        if (tarefa.titulo && tarefa.analista) {
                            tasks.push({
                                id: `projeto_${projeto.nome}_${tarefa.titulo}`,
                                titulo: tarefa.titulo,
                                analista: tarefa.analista,
                                projeto: projeto.nome,
                                tipo: 'projeto',
                                status: tarefa.status || 'Backlog',
                                dataInicio: tarefa.inicio || '2025-01-01',
                                dataFim: tarefa.fim || '2025-12-31',
                                horasEstimadas: 8, // Valor padrão
                                prioridade: 'Média',
                                progresso: 0,
                                descricao: `Tarefa do projeto ${projeto.nome}`,
                                observacoes: ''
                            });
                        }
                    });
                }
            });
        }

        // Carregar tarefas das sustentações
        if (data.sustentacoes && Array.isArray(data.sustentacoes)) {
            data.sustentacoes.forEach(sustentacao => {
                if (sustentacao.tarefasDetalhadas && Array.isArray(sustentacao.tarefasDetalhadas)) {
                    sustentacao.tarefasDetalhadas.forEach(tarefa => {
                        if (tarefa.titulo && tarefa.analista) {
                            tasks.push({
                                id: `sustentacao_${sustentacao.nome}_${tarefa.titulo}`,
                                titulo: tarefa.titulo,
                                analista: tarefa.analista,
                                projeto: sustentacao.nome,
                                tipo: 'sustentacao',
                                status: tarefa.status || 'Backlog',
                                dataInicio: tarefa.inicio || '2025-01-01',
                                dataFim: tarefa.fim || '2025-12-31',
                                horasEstimadas: 8, // Valor padrão
                                prioridade: 'Média',
                                progresso: 0,
                                descricao: `Tarefa de sustentação ${sustentacao.nome}`,
                                observacoes: ''
                            });
                        }
                    });
                }
            });
        }

        console.log(`✅ Carregadas ${tasks.length} tarefas dos projetos e sustentações`);

        res.json({
            success: true,
            data: tasks,
            message: `Carregadas ${tasks.length} tarefas dos projetos e sustentações`
        });

    } catch (error) {
        console.error('❌ Erro ao carregar tarefas para planejamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// Rota para obter categorias
router.get('/categorias', async (req, res) => {
    try {
        // Verificar se MongoDB está disponível
        const mongoose = require('mongoose');
        const isMongoAvailable = mongoose.connection.readyState === 1;
        
        if (isMongoAvailable) {
            // Buscar do MongoDB
            const Categoria = require('../models/Categoria');
            const categorias = await Categoria.find({ ativa: true }).sort({ nome: 1 });
            
            res.json({
                success: true,
                data: categorias
            });
        } else {
            // Fallback para JSON
            const dashboardData = getDashboardData();
            
            if (!dashboardData || !dashboardData.categorias) {
                return res.status(404).json({
                    success: false,
                    message: 'Dados não encontrados'
                });
            }

            res.json({
                success: true,
                data: dashboardData.categorias
            });
        }

    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar categorias',
            error: error.message
        });
    }
});

// Rota para obter sustentações
router.get('/sustentacoes', async (req, res) => {
    try {
        // Verificar se MongoDB está disponível
        const mongoose = require('mongoose');
        const isMongoAvailable = mongoose.connection.readyState === 1;
        
        if (isMongoAvailable) {
            // Buscar do MongoDB
            const Sustentacao = require('../models/Sustentacao');
            const sustentacoes = await Sustentacao.find({}).sort({ nome: 1 });
            
            res.json({
                success: true,
                data: sustentacoes
            });
        } else {
            // Fallback para JSON
            const dashboardData = getDashboardData();
            
            if (!dashboardData || !dashboardData.sustentacoes) {
                return res.status(404).json({
                    success: false,
                    message: 'Dados não encontrados'
                });
            }

            res.json({
                success: true,
                data: dashboardData.sustentacoes
            });
        }

    } catch (error) {
        console.error('Erro ao buscar sustentações:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar sustentações',
            error: error.message
        });
    }
});

// Rota para verificar se MongoDB está disponível
router.get('/check-mongodb', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const isAvailable = mongoose.connection.readyState === 1;
        
        res.json({
            success: true,
            available: isAvailable,
            status: mongoose.connection.readyState
        });
    } catch (error) {
        res.json({
            success: false,
            available: false,
            error: error.message
        });
    }
});


module.exports = router; 