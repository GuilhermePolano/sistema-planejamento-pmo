const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ExcelProcessor = require('../services/excelProcessor');

const router = express.Router();

// Função para ler dados do arquivo JSON com melhor tratamento de erro
function getDashboardData() {
    try {
        const jsonPath = path.join(__dirname, '../data/dashboard-data.json');
        if (!fs.existsSync(jsonPath)) {
            console.log('⚠️ Arquivo dashboard-data.json não encontrado');
            return null;
        }
        const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
        const data = JSON.parse(jsonContent);
        
        // Validar estrutura básica dos dados
        if (!data || typeof data !== 'object') {
            console.error('❌ Dados JSON inválidos');
            return null;
        }
        
        return data;
    } catch (error) {
        console.error('❌ Erro ao ler dados do JSON:', error);
        return null;
    }
}

// Função para verificar se MongoDB está disponível
function isMongoDBAvailable() {
    try {
        const mongoose = require('mongoose');
        return mongoose.connection.readyState === 1;
    } catch (error) {
        return false;
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

// Middleware para tratamento de erros do Multer
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'Arquivo muito grande. Tamanho máximo: 10MB'
            });
        }
    }
    next(error);
};

// Rota para upload e processamento de arquivo Excel
router.post('/upload-excel', upload.single('excelFile'), handleUploadError, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: 'Nenhum arquivo foi enviado' 
            });
        }

        console.log(`📤 Arquivo recebido: ${req.file.originalname} (${req.file.size} bytes)`);

        const processor = new ExcelProcessor();
        
        // Processar o arquivo enviado
        const processedData = await processor.processExcelFile(req.file.path);
        
        if (!processedData) {
            throw new Error('Falha no processamento do arquivo');
        }
        
        // Armazenar os dados processados para salvar depois
        processor.lastProcessedData = processedData;
        
        // Salvar no arquivo JSON
        const saveResult = await processor.saveToDatabase();

        // Remove o arquivo temporário
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
            console.log('🗑️ Arquivo temporário removido');
        }

        res.json({
            success: true,
            message: 'Arquivo processado com sucesso!',
            data: {
                arquivo: req.file.originalname,
                processados: saveResult,
                resumo: {
                    totalTarefas: processedData.tarefas?.length || 0,
                    totalProjetos: processedData.projetos?.length || 0,
                    totalAnalistas: processedData.analistas?.length || 0,
                    totalCategorias: processedData.categorias?.length || 0
                }
            }
        });

    } catch (error) {
        console.error('❌ Erro no upload:', error);
        
        // Remove arquivo em caso de erro
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
            console.log('🗑️ Arquivo temporário removido após erro');
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
            data: dashboardData,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Erro ao buscar dados do dashboard:', error);
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

        const totalTarefas = dashboardData.tarefas?.length || 0;
        const totalProjetos = dashboardData.projetos?.length || 0;
        const totalAnalistas = dashboardData.analistas?.length || 0;

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

        // Calcular tarefas atrasadas
        const tarefasAtrasadas = dashboardData.tarefas ? 
            dashboardData.tarefas.filter(tarefa => tarefa.atrasada === true).length : 0;

        // Calcular tarefas deste mês
        const tarefasMesAtual = dashboardData.tarefas ? 
            dashboardData.tarefas.filter(tarefa => {
                if (!tarefa.dataFinal) return false;
                const dataFinal = new Date(tarefa.dataFinal);
                return dataFinal.getMonth() === hoje.getMonth() && 
                       dataFinal.getFullYear() === hoje.getFullYear();
            }).length : 0;

        res.json({
            success: true,
            data: {
                totalProjetos,
                totalTarefas,
                totalAnalistas,
                analistasDisponiveis,
                percentualDisponibilidade: `${percentualDisponibilidade}%`,
                tarefasAtrasadas,
                tarefasMesAtual,
                ultimaAtualizacao: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Erro ao buscar estatísticas:', error);
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
        console.error('❌ Erro ao reprocessar dados:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao reprocessar dados',
            error: error.message
        });
    }
});

// Rota para obter analistas com melhor ordenação
router.get('/analistas', async (req, res) => {
    try {
        // Verificar se MongoDB está disponível
        const isMongoAvailable = isMongoDBAvailable();
        
        if (isMongoAvailable) {
            // Buscar do MongoDB
            const Analista = require('../models/Analista');
            const analistas = await Analista.find({}).sort({ nome: 1 });
            
            res.json({
                success: true,
                data: analistas,
                source: 'mongodb'
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
            const analistasOrdenados = dashboardData.analistas
                .filter(analista => analista.nome) // Filtrar analistas sem nome
                .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

            res.json({
                success: true,
                data: analistasOrdenados,
                source: 'json'
            });
        }

    } catch (error) {
        console.error('❌ Erro ao buscar analistas:', error);
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
        console.error('❌ Erro ao buscar projetos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar projetos',
            error: error.message
        });
    }
});

// Rota para buscar tarefas com melhor filtragem
router.get('/tarefas', async (req, res) => {
    try {
        const dashboardData = getDashboardData();
        
        if (!dashboardData || !dashboardData.tarefas) {
            return res.status(404).json({
                success: false,
                message: 'Dados não encontrados. Execute o processamento primeiro.'
            });
        }

        const { projeto, analista, status, atrasada, search, limit = 100 } = req.query;
        let tarefas = dashboardData.tarefas;

        // Aplicar filtros
        if (projeto) {
            tarefas = tarefas.filter(t => 
                t.projeto && t.projeto.toLowerCase().includes(projeto.toLowerCase())
            );
        }
        if (analista) {
            tarefas = tarefas.filter(t => 
                t.responsavel && t.responsavel.toLowerCase().includes(analista.toLowerCase())
            );
        }
        if (status) {
            tarefas = tarefas.filter(t => t.status === status);
        }
        if (atrasada === 'true') {
            tarefas = tarefas.filter(t => t.atrasada === true);
        }
        if (search) {
            const searchLower = search.toLowerCase();
            tarefas = tarefas.filter(t => 
                (t.projeto && t.projeto.toLowerCase().includes(searchLower)) ||
                (t.resumo && t.resumo.toLowerCase().includes(searchLower)) ||
                (t.responsavel && t.responsavel.toLowerCase().includes(searchLower)) ||
                (t.observacoes && t.observacoes.toLowerCase().includes(searchLower))
            );
        }

        // Ordenar por data final e limitar
        tarefas.sort((a, b) => {
            if (!a.dataFinal) return 1;
            if (!b.dataFinal) return -1;
            return new Date(a.dataFinal) - new Date(b.dataFinal);
        });
        
        const limitNum = parseInt(limit) || 100;
        tarefas = tarefas.slice(0, limitNum);

        res.json({ 
            success: true, 
            data: tarefas,
            total: tarefas.length,
            filtros: { projeto, analista, status, atrasada, search, limit: limitNum }
        });

    } catch (error) {
        console.error('❌ Erro ao buscar tarefas:', error);
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
        console.error('❌ Erro ao buscar tarefas dos analistas:', error);
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
        console.error('❌ Erro ao buscar categorias:', error);
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
        console.error('❌ Erro ao buscar sustentações:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar sustentações',
            error: error.message
        });
    }
});

// Rota para recalcular status dos projetos
router.post('/recalcular-status-projetos', async (req, res) => {
    try {
        console.log('🔄 Iniciando recálculo de status dos projetos...');
        
        const dashboardData = getDashboardData();
        
        if (!dashboardData) {
            return res.status(404).json({
                success: false,
                message: 'Dados não encontrados. Execute o processamento primeiro.'
            });
        }

        // Função para calcular status do projeto
        function calcularStatusProjeto(tarefasDetalhadas) {
            if (!tarefasDetalhadas || tarefasDetalhadas.length === 0) {
                return 'Backlog';
            }

            const statusCount = {
                'Backlog': 0,
                'Em Análise': 0,
                'Em Análise Técnica': 0,
                'Em Análise de Negócio': 0,
                'Em Desenvolvimento': 0,
                'Em Homologação': 0,
                'Pronto para Teste': 0,
                'Concluída': 0,
                'Produção': 0
            };

            tarefasDetalhadas.forEach(tarefa => {
                const status = tarefa.status || 'Backlog';
                statusCount[status] = (statusCount[status] || 0) + 1;
            });

            const totalTarefas = tarefasDetalhadas.length;

            // Regra 1: Se tem pelo menos uma atividade em Homologação
            if (statusCount['Em Homologação'] > 0) {
                return 'Em Homologação';
            }

            // Regra 2: Se tem pelo menos uma atividade em Desenvolvimento
            if (statusCount['Em Desenvolvimento'] > 0) {
                return 'Em Desenvolvimento';
            }

            // Regra 3: Se tem pelo menos uma atividade em Pronto para Teste
            if (statusCount['Pronto para Teste'] > 0) {
                return 'Em Desenvolvimento';
            }

            // Regra 4: Se todas as atividades estão em Backlog
            if (statusCount['Backlog'] === totalTarefas) {
                return 'Backlog';
            }

            // Regra 5: Se tem atividades em Análise
            if (statusCount['Em Análise'] > 0 || statusCount['Em Análise Técnica'] > 0 || statusCount['Em Análise de Negócio'] > 0) {
                const analiseTecnica = statusCount['Em Análise Técnica'] || 0;
                const analiseNegocio = statusCount['Em Análise de Negócio'] || 0;
                const analiseGeral = statusCount['Em Análise'] || 0;

                if (analiseTecnica > 0) {
                    return 'Em Análise Técnica';
                } else if (analiseNegocio > 0) {
                    return 'Em Análise de Negócio';
                } else if (analiseGeral > 0) {
                    return 'Em Análise';
                }
            }

            // Regra 6: Se todas as atividades estão concluídas
            if (statusCount['Concluída'] === totalTarefas) {
                return 'Concluído';
            }

            // Regra 7: Se todas as atividades estão em produção
            if (statusCount['Produção'] === totalTarefas) {
                return 'Produção';
            }

            // Regra 8: Caso padrão
            return 'Em Andamento';
        }

        let projetosAtualizados = 0;
        let sustentacoesAtualizadas = 0;

        // Recalcular status dos projetos
        if (dashboardData.projetos) {
            dashboardData.projetos.forEach(projeto => {
                if (projeto.tarefasDetalhadas && projeto.tarefasDetalhadas.length > 0) {
                    const statusAnterior = projeto.status;
                    const novoStatus = calcularStatusProjeto(projeto.tarefasDetalhadas);
                    
                    if (statusAnterior !== novoStatus) {
                        projeto.status = novoStatus;
                        projetosAtualizados++;
                        console.log(`📊 Projeto "${projeto.nome}": ${statusAnterior} → ${novoStatus}`);
                    }
                }
            });
        }

        // Recalcular status das sustentações
        if (dashboardData.sustentacoes) {
            dashboardData.sustentacoes.forEach(sustentacao => {
                if (sustentacao.tarefasDetalhadas && sustentacao.tarefasDetalhadas.length > 0) {
                    const statusAnterior = sustentacao.status;
                    const novoStatus = calcularStatusProjeto(sustentacao.tarefasDetalhadas);
                    
                    if (statusAnterior !== novoStatus) {
                        sustentacao.status = novoStatus;
                        sustentacoesAtualizadas++;
                        console.log(`🔧 Sustentação "${sustentacao.nome}": ${statusAnterior} → ${novoStatus}`);
                    }
                }
            });
        }

        // Salvar dados atualizados
        const jsonPath = path.join(__dirname, '../data/dashboard-data.json');
        fs.writeFileSync(jsonPath, JSON.stringify(dashboardData, null, 2));

        console.log(`✅ Recálculo concluído: ${projetosAtualizados} projetos e ${sustentacoesAtualizadas} sustentações atualizados`);

        res.json({
            success: true,
            message: 'Status dos projetos recalculado com sucesso!',
            data: {
                projetosAtualizados,
                sustentacoesAtualizadas,
                totalProjetos: dashboardData.projetos?.length || 0,
                totalSustentacoes: dashboardData.sustentacoes?.length || 0
            }
        });

    } catch (error) {
        console.error('❌ Erro ao recalcular status dos projetos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao recalcular status dos projetos',
            error: error.message
        });
    }
});

// Rota para verificar status do sistema
router.get('/system-status', async (req, res) => {
    try {
        const mongoStatus = isMongoDBAvailable();
        const dashboardData = getDashboardData();
        
        res.json({
            success: true,
            data: {
                mongodb: {
                    available: mongoStatus,
                    status: mongoStatus ? 'connected' : 'disconnected'
                },
                data: {
                    available: !!dashboardData,
                    lastUpdate: dashboardData ? new Date().toISOString() : null
                },
                server: {
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime()
                }
            }
        });
    } catch (error) {
        console.error('❌ Erro ao verificar status do sistema:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao verificar status',
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

// Rota para debug de status de projeto específico
router.get('/debug-projeto/:nomeProjeto', async (req, res) => {
    try {
        const { nomeProjeto } = req.params;
        console.log(`🔍 Debugando projeto: ${nomeProjeto}`);
        
        const data = getDashboardData();
        if (!data || !data.projetos) {
            return res.status(404).json({
                success: false,
                message: 'Dados não encontrados'
            });
        }
        
        const projeto = data.projetos.find(p => 
            p.nome && p.nome.toLowerCase().includes(nomeProjeto.toLowerCase())
        );
        
        if (!projeto) {
            return res.status(404).json({
                success: false,
                message: `Projeto "${nomeProjeto}" não encontrado`,
                projetosDisponiveis: data.projetos.map(p => p.nome).slice(0, 10)
            });
        }
        
        // Simular cálculo de status
        const ExcelProcessor = require('../services/excelProcessor');
        const processor = new ExcelProcessor();
        const statusCalculado = processor.calcularStatusProjeto(projeto.tarefasDetalhadas);
        
        res.json({
            success: true,
            projeto: {
                nome: projeto.nome,
                statusAtual: projeto.status,
                statusCalculado: statusCalculado,
                totalTarefas: projeto.tarefasDetalhadas.length,
                tarefasDetalhadas: projeto.tarefasDetalhadas.map(t => ({
                    titulo: t.titulo,
                    status: t.status,
                    analista: t.analista
                }))
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Erro ao debugar projeto:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao debugar projeto',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router; 