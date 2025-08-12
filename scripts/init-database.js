const mongoose = require('mongoose');
const Tarefa = require('../models/Tarefa');
const Projeto = require('../models/Projeto');
const Analista = require('../models/Analista');
require('dotenv').config({ path: '../config.env' });

// Dados de exemplo para inicialização
const dadosExemplo = {
    tarefas: [
        {
            nomeProjeto: "IA Sistema Fiergs - HUB da IA",
            nomeTarefa: "Gestão de Permissões de Acessos",
            tipoItem: "Story",
            chaveJira: "FIERGS-001",
            analistaTecnico: "Maike Naysinger Borges",
            analistaNegocio: "Guilherme Polano Corrêa",
            dataInicioPrevista: new Date("2025-05-20"),
            dataFimPrevista: new Date("2025-07-31"),
            status: "Em Desenvolvimento",
            squad: "Squad Digital",
            categoria: "Java"
        },
        {
            nomeProjeto: "IA Sistema Fiergs - HUB da IA",
            nomeTarefa: "Chat GPT Corporativo",
            tipoItem: "Story",
            chaveJira: "FIERGS-002",
            analistaTecnico: "Leonardo Santos Rodrigues",
            analistaNegocio: "Guilherme Polano Corrêa",
            dataInicioPrevista: new Date("2025-05-28"),
            dataFimPrevista: new Date("2025-07-15"),
            status: "Em Desenvolvimento",
            squad: "Squad Digital",
            categoria: "Front End"
        },
        {
            nomeProjeto: "Migração tecnológica da Central de Notas",
            nomeTarefa: "Fase 2 - correções solicitadas na homologação",
            tipoItem: "Task",
            chaveJira: "FIERGS-003",
            analistaTecnico: "Carlos Francisco Habekost dos Santos",
            analistaNegocio: "Andre Batista da Silva",
            dataInicioPrevista: new Date("2025-07-21"),
            dataFimPrevista: new Date("2025-08-22"),
            status: "Em Desenvolvimento",
            squad: "Squad BPMS",
            categoria: "BAW"
        },
        {
            nomeProjeto: "Sustentação AgilInM",
            nomeTarefa: "NEGOCIAÇÕES/SPA - Inclusão de Interesse no Select",
            tipoItem: "Bug",
            chaveJira: "FIERGS-004",
            analistaTecnico: "Alexandre Riff da Costa",
            analistaNegocio: "Maike Naysinger Borges",
            dataInicioPrevista: new Date("2025-04-07"),
            dataFimPrevista: new Date("2025-07-31"),
            status: "Em Desenvolvimento",
            squad: "Squad Digital",
            categoria: "PHP"
        }
    ],
    projetos: [
        {
            nome: "IA Sistema Fiergs - HUB da IA",
            po: "Guilherme Polano Corrêa",
            squad: "Squad Digital",
            dataInicio: new Date("2025-05-13"),
            dataFim: new Date("2026-02-27"),
            status: "Em Desenvolvimento",
            descricao: "Sistema de IA para FIERGS",
            prioridade: "Alta"
        },
        {
            nome: "Migração tecnológica da Central de Notas",
            po: "Andre Batista da Silva",
            squad: "Squad BPMS",
            dataInicio: new Date("2024-07-01"),
            dataFim: new Date("2025-08-22"),
            status: "Em Homologação",
            descricao: "Migração do sistema de notas",
            prioridade: "Média"
        },
        {
            nome: "Sustentação AgilInM",
            po: "Maike Naysinger Borges",
            squad: "Squad Digital",
            dataInicio: new Date("2025-02-19"),
            dataFim: new Date("2025-07-31"),
            status: "Produção",
            descricao: "Sustentação do sistema AgilInM",
            prioridade: "Baixa"
        }
    ],
    analistas: [
        {
            nome: "Maike Naysinger Borges",
            categoria: "Java",
            squad: "Squad Digital",
            email: "maike.borges@fiergs.com.br",
            nivel: "Sênior",
            dataContratacao: new Date("2020-01-15"),
            disponivel: false,
            dataFinalUltimaTarefa: new Date("2025-08-15"),
            cargaHoraria: 40
        },
        {
            nome: "Leonardo Santos Rodrigues",
            categoria: "Front End",
            squad: "Squad Digital",
            email: "leonardo.rodrigues@fiergs.com.br",
            nivel: "Pleno",
            dataContratacao: new Date("2021-03-20"),
            disponivel: false,
            dataFinalUltimaTarefa: new Date("2026-01-30"),
            cargaHoraria: 40
        },
        {
            nome: "Carlos Francisco Habekost dos Santos",
            categoria: "BAW",
            squad: "Squad BPMS",
            email: "carlos.habekost@fiergs.com.br",
            nivel: "Sênior",
            dataContratacao: new Date("2019-06-10"),
            disponivel: false,
            dataFinalUltimaTarefa: new Date("2025-08-22"),
            cargaHoraria: 40
        },
        {
            nome: "Alexandre Riff da Costa",
            categoria: "PHP",
            squad: "Squad Digital",
            email: "alexandre.riff@fiergs.com.br",
            nivel: "Pleno",
            dataContratacao: new Date("2022-01-10"),
            disponivel: false,
            dataFinalUltimaTarefa: new Date("2025-07-31"),
            cargaHoraria: 40
        }
    ]
};

async function inicializarBanco() {
    try {
        console.log('🔌 Conectando ao MongoDB...');
        
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dashboard_pmo_fiergs', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ Conectado ao MongoDB com sucesso!');

        // Limpar dados existentes
        console.log('🧹 Limpando dados existentes...');
        await Tarefa.deleteMany({});
        await Projeto.deleteMany({});
        await Analista.deleteMany({});

        // Inserir dados de exemplo
        console.log('📝 Inserindo dados de exemplo...');

        const tarefasInseridas = await Tarefa.insertMany(dadosExemplo.tarefas);
        console.log(`✅ ${tarefasInseridas.length} tarefas inseridas`);

        const projetosInseridos = await Projeto.insertMany(dadosExemplo.projetos);
        console.log(`✅ ${projetosInseridos.length} projetos inseridos`);

        const analistasInseridos = await Analista.insertMany(dadosExemplo.analistas);
        console.log(`✅ ${analistasInseridos.length} analistas inseridos`);

        console.log('🎉 Banco de dados inicializado com sucesso!');
        console.log('📊 Você pode agora acessar o dashboard em: http://localhost:3000');

    } catch (error) {
        console.error('❌ Erro ao inicializar banco de dados:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado do MongoDB');
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    inicializarBanco();
}

module.exports = { inicializarBanco, dadosExemplo }; 