const fs = require('fs');
const path = require('path');

class ExcelProcessor {
    constructor() {
        this.csvFilePath = path.join(__dirname, '../Base_Temporaria/Alocação Time 11082025.csv');
        this.stacksFilePath = path.join(__dirname, '../Base_Temporaria/Stacks e Squads.csv');
        this.jsonOutputPath = path.join(__dirname, '../data/dashboard-data.json');
        this.lastProcessedData = null;
    }

    // Função para converter data do formato brasileiro para ISO
    parseDate(dateString) {
        if (!dateString || dateString === '#VALOR!' || dateString.trim() === '') {
            return null;
        }
        
        // Formato esperado: DD/MM/YYYY
        const parts = dateString.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1; // Mês começa em 0
            const year = parseInt(parts[2]);
            return new Date(year, month, day).toISOString().split('T')[0];
        }
        return null;
    }

    // Função para verificar se uma tarefa está atrasada
    isOverdue(dataFinal) {
        if (!dataFinal) return false;
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const dataFinalDate = new Date(dataFinal);
        return dataFinalDate < hoje;
    }

    // Função para determinar se é demanda deste mês
    isCurrentMonth(dataFinal) {
        if (!dataFinal) return false;
        const hoje = new Date();
        const dataFinalDate = new Date(dataFinal);
        return dataFinalDate.getMonth() === hoje.getMonth() && 
               dataFinalDate.getFullYear() === hoje.getFullYear();
    }

    // Função para carregar dados do arquivo Stacks e Squads
    loadStacksData() {
        try {
            if (!fs.existsSync(this.stacksFilePath)) {
                console.log('⚠️ Arquivo Stacks e Squads não encontrado. Continuando sem dados de stacks...');
                return new Map();
            }

            const csvContent = fs.readFileSync(this.stacksFilePath, 'utf-8');
            const lines = csvContent.split('\n');
            const headers = lines[0].split(';');
            const dataLines = lines.slice(1).filter(line => line.trim() !== '');
            
            const stacksMap = new Map();

            dataLines.forEach(line => {
                const values = line.split(';');
                if (values.length < 4) return;

                const nome = values[0]?.trim();
                const stack = values[1]?.trim();
                const squad = values[2]?.trim();
                const funcao = values[3]?.trim();

                if (nome) {
                    if (!stacksMap.has(nome)) {
                        stacksMap.set(nome, {
                            nome: nome,
                            stacks: [],
                            squads: [],
                            funcoes: []
                        });
                    }

                    const analista = stacksMap.get(nome);
                    if (stack && !analista.stacks.includes(stack)) {
                        analista.stacks.push(stack);
                    }
                    if (squad && !analista.squads.includes(squad)) {
                        analista.squads.push(squad);
                    }
                    if (funcao && !analista.funcoes.includes(funcao)) {
                        analista.funcoes.push(funcao);
                    }
                }
            });

            console.log(`✅ Dados de stacks carregados: ${stacksMap.size} analistas únicos`);
            return stacksMap;

        } catch (error) {
            console.error('❌ Erro ao carregar dados de stacks:', error);
            return new Map();
        }
    }

    // Função para processar arquivo Excel/CSV enviado via upload
    async processExcelFile(filePath) {
        try {
            console.log(`📁 Processando arquivo: ${filePath}`);
            
            // Verificar extensão do arquivo
            const ext = path.extname(filePath).toLowerCase();
            
            let csvContent;
            
            if (ext === '.csv') {
                // Arquivo CSV - ler diretamente
                csvContent = fs.readFileSync(filePath, 'utf-8');
            } else if (ext === '.xlsx' || ext === '.xls') {
                // Arquivo Excel - converter para CSV (simulação)
                // Por simplicidade, vamos assumir que o Excel já foi convertido
                // Em uma implementação real, você usaria uma biblioteca como 'xlsx'
                console.log('⚠️ Arquivo Excel detectado. Convertendo para CSV...');
                csvContent = fs.readFileSync(filePath, 'utf-8');
            } else {
                throw new Error('Formato de arquivo não suportado');
            }
            
            // Processar o conteúdo como CSV e armazenar em lastProcessedData
            this.lastProcessedData = this.processCSVContent(csvContent);
            return this.lastProcessedData;
            
        } catch (error) {
            console.error('❌ Erro ao processar arquivo Excel:', error);
            throw error;
        }
    }

    // Função para processar conteúdo CSV (extraída do processCSV)
    processCSVContent(csvContent) {
        try {
            // Carregar dados de stacks primeiro - SEMPRE carregar
            const stacksMap = this.loadStacksData();
            console.log(`📊 Carregados dados de stacks para ${stacksMap.size} analistas`);
            
            const lines = csvContent.split('\n');
            
            // Remover cabeçalho
            const headers = lines[0].split(';');
            const dataLines = lines.slice(1).filter(line => line.trim() !== '');
            
            const tarefas = [];
            const projetosMap = new Map();
            const analistasMap = new Map();
            const categoriasMap = new Map();
            const sustentacoesMap = new Map();

            // Primeiro, criar analistas baseados no arquivo Stacks e Squads
            stacksMap.forEach((stacksInfo, nome) => {
                analistasMap.set(nome, {
                    nome: nome,
                    categoria: stacksInfo.stacks.length > 0 ? stacksInfo.stacks[0] : 'Não definida',
                    squad: stacksInfo.squads.length > 0 ? stacksInfo.squads[0] : 'Não definido',
                    dataFinalUltimaTarefa: null,
                    projetos: [],
                    tarefasAtivas: 0,
                    stacks: stacksInfo.stacks,
                    funcoes: stacksInfo.funcoes,
                    squads: stacksInfo.squads
                });
            });

            // Criar um Map para busca case-insensitive de nomes
            const analistasMapCaseInsensitive = new Map();
            analistasMap.forEach((analista, nome) => {
                analistasMapCaseInsensitive.set(nome.toLowerCase(), analista);
            });

            dataLines.forEach(line => {
                const values = line.split(';');
                if (values.length < 14) return; // Pular linhas incompletas

                const tarefa = {
                    projeto: values[0]?.trim(),
                    resumo: values[1]?.trim(),
                    tipoItem: values[2]?.trim(),
                    chave: values[3]?.trim(),
                    responsavel: values[4]?.trim(),
                    relator: values[5]?.trim(),
                    dataInicial: this.parseDate(values[6]),
                    dataFinal: this.parseDate(values[7]),
                    status: values[8]?.trim(),
                    squad: values[9]?.trim(),
                    categoria: values[10]?.trim(),
                    atrasada: values[11]?.trim() === 'Atrasada',
                    demandaMes: values[12]?.trim() === 'Sim',
                    tipoDemanda: values[13]?.trim()
                };

                // Adicionar tarefa à lista
                tarefas.push(tarefa);

                // Verificar se é sustentação
                const isSustentacao = tarefa.tipoDemanda === 'Sustentação' || 
                                     (tarefa.projeto && tarefa.projeto.toLowerCase().includes('sustentação'));

                // Processar projeto - apenas se NÃO for sustentação
                if (tarefa.projeto && !projetosMap.has(tarefa.projeto) && !isSustentacao) {
                    projetosMap.set(tarefa.projeto, {
                        nome: tarefa.projeto,
                        po: tarefa.relator,
                        squad: tarefa.squad,
                        dataInicio: tarefa.dataInicial,
                        dataFim: tarefa.dataFinal,
                        status: tarefa.status,
                        tarefas: 0,
                        analistas: [],
                        tarefasDetalhadas: [],
                        tipoDemanda: tarefa.tipoDemanda
                    });
                }

                // Atualizar analista (responsável técnico) - apenas se existir no arquivo Stacks
                if (tarefa.responsavel && analistasMapCaseInsensitive.has(tarefa.responsavel.toLowerCase())) {
                    const analista = analistasMapCaseInsensitive.get(tarefa.responsavel.toLowerCase());
                    // Atualizar data final da última tarefa (mais recente)
                    if (tarefa.dataFinal && (!analista.dataFinalUltimaTarefa || tarefa.dataFinal > analista.dataFinalUltimaTarefa)) {
                        analista.dataFinalUltimaTarefa = tarefa.dataFinal;
                    }
                }

                // Atualizar analista (relator) - apenas se existir no arquivo Stacks
                if (tarefa.relator && analistasMapCaseInsensitive.has(tarefa.relator.toLowerCase())) {
                    const analista = analistasMapCaseInsensitive.get(tarefa.relator.toLowerCase());
                    // Atualizar data final da última tarefa (mais recente)
                    if (tarefa.dataFinal && (!analista.dataFinalUltimaTarefa || tarefa.dataFinal > analista.dataFinalUltimaTarefa)) {
                        analista.dataFinalUltimaTarefa = tarefa.dataFinal;
                    }
                }

                // Processar categoria
                if (tarefa.categoria && !categoriasMap.has(tarefa.categoria)) {
                    categoriasMap.set(tarefa.categoria, {
                        nome: tarefa.categoria,
                        analistas: []
                    });
                }

                // Processar sustentação
                if (isSustentacao) {
                    if (!sustentacoesMap.has(tarefa.projeto)) {
                        sustentacoesMap.set(tarefa.projeto, {
                            nome: tarefa.projeto,
                            po: tarefa.relator,
                            squad: tarefa.squad,
                            dataInicio: tarefa.dataInicial,
                            dataFim: tarefa.dataFinal,
                            status: tarefa.status,
                            tarefas: 0,
                            analistas: [],
                            tarefasDetalhadas: [],
                            tipoDemanda: tarefa.tipoDemanda
                        });
                    }
                }
            });

            // Processar relacionamentos
            tarefas.forEach(tarefa => {
                // Verificar se é sustentação
                const isSustentacao = tarefa.tipoDemanda === 'Sustentação' || 
                                     (tarefa.projeto && tarefa.projeto.toLowerCase().includes('sustentação'));

                // Adicionar tarefa ao projeto - apenas se for projeto (não sustentação)
                if (projetosMap.has(tarefa.projeto) && !isSustentacao) {
                    const projeto = projetosMap.get(tarefa.projeto);
                    projeto.tarefas++;
                    projeto.tarefasDetalhadas.push({
                        titulo: tarefa.resumo,
                        analista: tarefa.responsavel,
                        status: tarefa.status,
                        inicio: tarefa.dataInicial,
                        fim: tarefa.dataFinal
                    });

                    // Adicionar analista ao projeto se não existir
                    if (tarefa.responsavel && !projeto.analistas.includes(tarefa.responsavel)) {
                        projeto.analistas.push(tarefa.responsavel);
                    }

                    // Atualizar datas do projeto (mais antiga e mais recente)
                    if (tarefa.dataInicial && (!projeto.dataInicio || tarefa.dataInicial < projeto.dataInicio)) {
                        projeto.dataInicio = tarefa.dataInicial;
                    }
                    if (tarefa.dataFinal && (!projeto.dataFim || tarefa.dataFinal > projeto.dataFim)) {
                        projeto.dataFim = tarefa.dataFinal;
                    }
                }

                // Adicionar projeto ao analista (responsável técnico) - apenas se for projeto (não sustentação)
                if (analistasMapCaseInsensitive.has(tarefa.responsavel.toLowerCase()) && !isSustentacao) {
                    const analista = analistasMapCaseInsensitive.get(tarefa.responsavel.toLowerCase());
                    if (!analista.projetos.includes(tarefa.projeto)) {
                        analista.projetos.push(tarefa.projeto);
                    }
                    // Contar tarefa apenas uma vez para o responsável técnico
                    analista.tarefasAtivas++;

                    // Atualizar data final da última tarefa (mais recente)
                    if (tarefa.dataFinal && (!analista.dataFinalUltimaTarefa || tarefa.dataFinal > analista.dataFinalUltimaTarefa)) {
                        analista.dataFinalUltimaTarefa = tarefa.dataFinal;
                    }
                }

                // Adicionar projeto ao analista (relator - analista de negócio) - apenas se for projeto (não sustentação)
                if (analistasMapCaseInsensitive.has(tarefa.relator.toLowerCase()) && !isSustentacao) {
                    const analista = analistasMapCaseInsensitive.get(tarefa.relator.toLowerCase());
                    if (!analista.projetos.includes(tarefa.projeto)) {
                        analista.projetos.push(tarefa.projeto);
                    }
                    // Contar tarefa para o relator apenas se não for o mesmo que o responsável
                    if (tarefa.relator !== tarefa.responsavel) {
                        analista.tarefasAtivas++;
                    }

                    // Atualizar data final da última tarefa (mais recente)
                    if (tarefa.dataFinal && (!analista.dataFinalUltimaTarefa || tarefa.dataFinal > analista.dataFinalUltimaTarefa)) {
                        analista.dataFinalUltimaTarefa = tarefa.dataFinal;
                    }
                }

                // Adicionar analista à categoria (para projetos e sustentações)
                if (categoriasMap.has(tarefa.categoria) && tarefa.responsavel) {
                    const categoria = categoriasMap.get(tarefa.categoria);
                    const analistaExistente = categoria.analistas.find(a => a.nome === tarefa.responsavel);
                    if (!analistaExistente) {
                        categoria.analistas.push({
                            nome: tarefa.responsavel,
                            dataFinal: tarefa.dataFinal,
                            tarefas: 1,
                            tipoDemanda: tarefa.tipoDemanda
                        });
                    } else {
                        analistaExistente.tarefas++;
                        if (tarefa.dataFinal && (!analistaExistente.dataFinal || tarefa.dataFinal > analistaExistente.dataFinal)) {
                            analistaExistente.dataFinal = tarefa.dataFinal;
                        }
                    }
                }

                // Adicionar tarefa à sustentação - apenas se for sustentação
                if (isSustentacao && sustentacoesMap.has(tarefa.projeto)) {
                    const sustentacao = sustentacoesMap.get(tarefa.projeto);
                    sustentacao.tarefas++;
                    sustentacao.tarefasDetalhadas.push({
                        titulo: tarefa.resumo,
                        analista: tarefa.responsavel,
                        status: tarefa.status,
                        inicio: tarefa.dataInicial,
                        fim: tarefa.dataFinal
                    });

                    if (tarefa.responsavel && !sustentacao.analistas.includes(tarefa.responsavel)) {
                        sustentacao.analistas.push(tarefa.responsavel);
                    }

                    // Contar tarefa para o responsável da sustentação
                    if (analistasMapCaseInsensitive.has(tarefa.responsavel.toLowerCase())) {
                        const analista = analistasMapCaseInsensitive.get(tarefa.responsavel.toLowerCase());
                        analista.tarefasAtivas++;
                        
                        // Adicionar sustentação à lista de projetos do analista se não existir
                        if (!analista.projetos.includes(tarefa.projeto)) {
                            analista.projetos.push(tarefa.projeto);
                        }
                        
                        // Atualizar data final da última tarefa (mais recente)
                        if (tarefa.dataFinal && (!analista.dataFinalUltimaTarefa || tarefa.dataFinal > analista.dataFinalUltimaTarefa)) {
                            analista.dataFinalUltimaTarefa = tarefa.dataFinal;
                        }
                    }

                    // Contar tarefa para o relator da sustentação (se diferente do responsável)
                    if (analistasMapCaseInsensitive.has(tarefa.relator.toLowerCase()) && tarefa.relator !== tarefa.responsavel) {
                        const analista = analistasMapCaseInsensitive.get(tarefa.relator.toLowerCase());
                        analista.tarefasAtivas++;
                        
                        // Adicionar sustentação à lista de projetos do analista se não existir
                        if (!analista.projetos.includes(tarefa.projeto)) {
                            analista.projetos.push(tarefa.projeto);
                        }
                        
                        // Atualizar data final da última tarefa (mais recente)
                        if (tarefa.dataFinal && (!analista.dataFinalUltimaTarefa || tarefa.dataFinal > analista.dataFinalUltimaTarefa)) {
                            analista.dataFinalUltimaTarefa = tarefa.dataFinal;
                        }
                    }

                    if (tarefa.dataInicial && (!sustentacao.dataInicio || tarefa.dataInicial < sustentacao.dataInicio)) {
                        sustentacao.dataInicio = tarefa.dataInicial;
                    }
                    if (tarefa.dataFinal && (!sustentacao.dataFim || tarefa.dataFinal > sustentacao.dataFim)) {
                        sustentacao.dataFim = tarefa.dataFinal;
                    }
                }
            });

            // Converter Maps para arrays
            const projetos = Array.from(projetosMap.values());
            const analistas = Array.from(analistasMap.values());
            const categorias = Array.from(categoriasMap.values());
            const sustentacoes = Array.from(sustentacoesMap.values());

            // Adicionar stacks às categorias
            const stacksSet = new Set();
            analistas.forEach(analista => {
                if (analista.stacks && analista.stacks.length > 0) {
                    analista.stacks.forEach(stack => {
                        if (stack && !stacksSet.has(stack)) {
                            stacksSet.add(stack);
                            // Verificar se a categoria já existe
                            const categoriaExistente = categorias.find(cat => cat.nome === stack);
                            if (!categoriaExistente) {
                                categorias.push({
                                    nome: stack,
                                    analistas: []
                                });
                            }
                        }
                    });
                }
            });

            console.log(`🔧 Stacks adicionadas às categorias: ${Array.from(stacksSet).join(', ')}`);

            // Processar analistas por função
            const analistasPorFuncao = {
                'Analista de Negócio': [],
                'Responsável Técnico': [],
                'Analista Técnico': [],
                'UX': [],
                'Coordenação': []
            };

            // Criar um Set para rastrear analistas únicos por função
            const analistasUnicosPorFuncao = {
                'Analista de Negócio': new Set(),
                'Responsável Técnico': new Set(),
                'Analista Técnico': new Set(),
                'UX': new Set(),
                'Coordenação': new Set()
            };

            analistas.forEach(analista => {
                // Se o analista tem funções definidas no arquivo Stacks e Squads
                if (analista.funcoes && analista.funcoes.length > 0) {
                    analista.funcoes.forEach(funcao => {
                        if (analistasPorFuncao[funcao]) {
                            // Adicionar apenas se não existir na função
                            if (!analistasUnicosPorFuncao[funcao].has(analista.nome)) {
                                analistasUnicosPorFuncao[funcao].add(analista.nome);
                                analistasPorFuncao[funcao].push(analista);
                            }
                        }
                    });
                } else {
                    // Se não tem função definida, NÃO adicionar automaticamente como Analista Técnico
                    // Apenas adicionar se realmente for um Analista Técnico
                    console.log(`⚠️ Analista ${analista.nome} não tem função definida no arquivo Stacks e Squads`);
                }
            });

            console.log(`👥 Analistas por função processados:`);
            Object.entries(analistasPorFuncao).forEach(([funcao, lista]) => {
                console.log(`  - ${funcao}: ${lista.length} analistas`);
            });

            // Criar estrutura final
            const dashboardData = {
                projetos,
                analistas,
                categorias,
                tarefas,
                sustentacoes,
                analistasPorFuncao,
                metadata: {
                    totalProjetos: projetos.length,
                    totalAnalistas: analistas.length,
                    totalTarefas: tarefas.length,
                    totalCategorias: categorias.length,
                    totalSustentacoes: sustentacoes.length,
                    ultimaAtualizacao: new Date().toISOString()
                }
            };

            return dashboardData;

        } catch (error) {
            console.error('❌ Erro ao processar conteúdo CSV:', error);
            throw error;
        }
    }

    // Função para verificar se MongoDB está disponível
    isMongoDBAvailable() {
        try {
            const mongoose = require('mongoose');
            return mongoose.connection.readyState === 1;
        } catch (error) {
            return false;
        }
    }

    // Função para salvar dados no MongoDB ou JSON como fallback
    async saveToDatabase() {
        try {
            if (this.isMongoDBAvailable()) {
                // Salvar no MongoDB
                return await this.saveToMongoDB();
            } else {
                // Fallback para JSON
                return await this.saveToJSON();
            }
        } catch (error) {
            console.error('❌ Erro ao salvar dados:', error);
            throw error;
        }
    }

    // Função para salvar no MongoDB
    async saveToMongoDB() {
        try {
            const Tarefa = require('../models/Tarefa');
            const Analista = require('../models/Analista');
            const Projeto = require('../models/Projeto');
            const Categoria = require('../models/Categoria');
            const Sustentacao = require('../models/Sustentacao');

            console.log('🗄️ Salvando dados no MongoDB...');

            // Limpar dados existentes
            await Tarefa.deleteMany({});
            await Analista.deleteMany({});
            await Projeto.deleteMany({});
            await Categoria.deleteMany({});
            await Sustentacao.deleteMany({});

            // Salvar tarefas
            const tarefasSalvas = [];
            for (const tarefa of this.lastProcessedData.tarefas) {
                const novaTarefa = new Tarefa({
                    nomeProjeto: tarefa.projeto,
                    nomeTarefa: tarefa.resumo,
                    tipoItem: tarefa.tipoItem,
                    chaveJira: tarefa.chave,
                    analistaTecnico: tarefa.responsavel,
                    analistaNegocio: tarefa.analistaNegocio || tarefa.responsavel,
                    dataInicioPrevista: tarefa.dataInicial,
                    dataFimPrevista: tarefa.dataFinal,
                    status: tarefa.status,
                    squad: tarefa.squad,
                    categoria: tarefa.categoria,
                    observacoes: tarefa.observacoes || ''
                });
                tarefasSalvas.push(await novaTarefa.save());
            }

            // Salvar analistas
            const analistasSalvos = [];
            for (const analista of this.lastProcessedData.analistas) {
                const novoAnalista = new Analista({
                    nome: analista.nome,
                    categoria: analista.categoria,
                    squad: analista.squad,
                    stacks: analista.stacks || [],
                    funcoes: analista.funcoes || [],
                    dataFinalUltimaTarefa: analista.dataFinalUltimaTarefa,
                    tarefasAtivas: analista.tarefasAtivas,
                    projetos: analista.projetos
                });
                analistasSalvos.push(await novoAnalista.save());
            }

            // Salvar projetos
            const projetosSalvos = [];
            for (const projeto of this.lastProcessedData.projetos) {
                const novoProjeto = new Projeto({
                    nome: projeto.nome,
                    po: projeto.po,
                    squad: projeto.squad,
                    status: projeto.status,
                    dataInicio: projeto.dataInicio,
                    dataFim: projeto.dataFim,
                    tarefas: projeto.tarefas,
                    analistas: projeto.analistas,
                    tarefasDetalhadas: projeto.tarefasDetalhadas
                });
                projetosSalvos.push(await novoProjeto.save());
            }

            // Salvar categorias
            const categoriasSalvas = [];
            for (const categoria of this.lastProcessedData.categorias) {
                const novaCategoria = new Categoria({
                    nome: categoria.nome,
                    analistas: categoria.analistas
                });
                categoriasSalvas.push(await novaCategoria.save());
            }

            // Salvar sustentações
            const sustentacoesSalvas = [];
            for (const sustentacao of this.lastProcessedData.sustentacoes) {
                const novaSustentacao = new Sustentacao({
                    nome: sustentacao.nome,
                    po: sustentacao.po,
                    squad: sustentacao.squad,
                    status: sustentacao.status,
                    dataInicio: sustentacao.dataInicio,
                    dataFim: sustentacao.dataFim,
                    tarefas: sustentacao.tarefas,
                    analistas: sustentacao.analistas,
                    tarefasDetalhadas: sustentacao.tarefasDetalhadas
                });
                sustentacoesSalvas.push(await novaSustentacao.save());
            }

            console.log('✅ Dados salvos no MongoDB com sucesso!');
            console.log(`📊 Projetos: ${projetosSalvos.length}`);
            console.log(`👥 Analistas: ${analistasSalvos.length}`);
            console.log(`📋 Tarefas: ${tarefasSalvas.length}`);
            console.log(`🔧 Categorias: ${categoriasSalvas.length}`);
            console.log(`🔧 Sustentações: ${sustentacoesSalvas.length}`);

            return {
                projetos: projetosSalvos.length,
                analistas: analistasSalvos.length,
                tarefas: tarefasSalvas.length,
                categorias: categoriasSalvas.length,
                sustentacoes: sustentacoesSalvas.length
            };

        } catch (error) {
            console.error('❌ Erro ao salvar no MongoDB:', error);
            throw error;
        }
    }

    // Função para salvar no JSON (fallback)
    async saveToJSON() {
        try {
            // Criar diretório se não existir
            const dataDir = path.dirname(this.jsonOutputPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            // Salvar JSON
            fs.writeFileSync(this.jsonOutputPath, JSON.stringify(this.lastProcessedData, null, 2), 'utf-8');
            
            console.log('✅ Dados salvos no JSON com sucesso!');
            console.log(`📊 Projetos: ${this.lastProcessedData.projetos.length}`);
            console.log(`👥 Analistas: ${this.lastProcessedData.analistas.length}`);
            console.log(`📋 Tarefas: ${this.lastProcessedData.tarefas.length}`);
            console.log(`🔧 Categorias: ${this.lastProcessedData.categorias.length}`);
            console.log(`🔧 Sustentações: ${this.lastProcessedData.sustentacoes.length}`);
            console.log(`💾 Arquivo salvo em: ${this.jsonOutputPath}`);

            return {
                projetos: this.lastProcessedData.projetos.length,
                analistas: this.lastProcessedData.analistas.length,
                tarefas: this.lastProcessedData.tarefas.length,
                categorias: this.lastProcessedData.categorias.length,
                sustentacoes: this.lastProcessedData.sustentacoes.length
            };

        } catch (error) {
            console.error('❌ Erro ao salvar dados no JSON:', error);
            throw error;
        }
    }

    // Função para processar o CSV (mantida para compatibilidade)
    processCSV() {
        try {
            const csvContent = fs.readFileSync(this.csvFilePath, 'utf-8');
            this.lastProcessedData = this.processCSVContent(csvContent);
            
            // Salvar automaticamente
            this.saveToDatabase();
            
            return this.lastProcessedData;

        } catch (error) {
            console.error('❌ Erro ao processar arquivo CSV:', error);
            throw error;
        }
    }

    // Função para recarregar dados
    reloadData() {
        return this.processCSV();
    }

    // Função para obter dados do JSON
    getData() {
        try {
            if (!fs.existsSync(this.jsonOutputPath)) {
                console.log('📝 Arquivo JSON não encontrado. Processando CSV...');
                return this.processCSV();
            }
            
            const jsonContent = fs.readFileSync(this.jsonOutputPath, 'utf-8');
            return JSON.parse(jsonContent);
        } catch (error) {
            console.error('❌ Erro ao ler arquivo JSON:', error);
            console.log('🔄 Tentando reprocessar CSV...');
            return this.processCSV();
        }
    }
}

module.exports = ExcelProcessor; 