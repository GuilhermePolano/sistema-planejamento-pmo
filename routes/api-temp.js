const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Função para ler dados do arquivo JSON
function getDashboardData() {
    try {
        const jsonPath = path.join(__dirname, '../data/dashboard-data.json');
        if (!fs.existsSync(jsonPath)) {
            console.log('⚠️ Arquivo dashboard-data.json não encontrado');
            return null;
        }
        const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
        const data = JSON.parse(jsonContent);
        return data;
    } catch (error) {
        console.error('❌ Erro ao ler dados do JSON:', error);
        return null;
    }
}

// Rota para obter indicadores de projetos
router.get('/indicadores-projetos', async (req, res) => {
    try {
        const { projeto, squad, status, periodo } = req.query;
        console.log('📊 Buscando indicadores de projetos...');
        
        const dashboardData = getDashboardData();
        
        if (!dashboardData) {
            return res.status(404).json({
                success: false,
                message: 'Dados não encontrados. Execute o processamento primeiro.'
            });
        }

        let projetos = dashboardData.projetos || [];
        
        // Aplicar filtros
        if (projeto) {
            projetos = projetos.filter(p => 
                p.nome && p.nome.toLowerCase().includes(projeto.toLowerCase())
            );
        }
        
        if (squad) {
            projetos = projetos.filter(p => 
                p.squad && p.squad.toLowerCase().includes(squad.toLowerCase())
            );
        }
        
        if (status) {
            projetos = projetos.filter(p => {
                const projetoStatus = calcularStatusProjeto(p);
                return projetoStatus === status;
            });
        }
        
        // Calcular indicadores
        const hoje = new Date();
        const indicadores = {
            totalProjetos: projetos.length,
            projetosAtrasados: 0,
            projetosAtencao: 0,
            projetosNoPrazo: 0,
            taxaConclusao: 0,
            capacidadeUtilizada: 0,
            tarefasHistorias: 0,
            tarefasBugs: 0,
            projetos: [],
            alertasCriticos: []
        };
        
        let totalTarefas = 0;
        let totalTarefasConcluidas = 0;
        let totalCapacidade = 0;
        let capacidadeUsada = 0;
        
        projetos.forEach(projeto => {
            // Calcular status do projeto
            const projetoStatus = calcularStatusProjeto(projeto);
            if (projetoStatus === 'atrasado') indicadores.projetosAtrasados++;
            else if (projetoStatus === 'atencao') indicadores.projetosAtencao++;
            else if (projetoStatus === 'no-prazo') indicadores.projetosNoPrazo++;
            
            // Contar tarefas
            const historias = projeto.historias || 0;
            const bugs = projeto.bugs || 0;
            const historiasConcluidas = projeto.historiasConcluidas || 0;
            const bugsConcluidos = projeto.bugsConcluidos || 0;
            
            indicadores.tarefasHistorias += historias;
            indicadores.tarefasBugs += bugs;
            totalTarefas += historias + bugs;
            totalTarefasConcluidas += historiasConcluidas + bugsConcluidos;
            
            // Calcular velocidade (simulada)
            const velocidade = Math.random() * 5 + 1; // 1-6 tarefas/dia
            
            // Calcular capacidade
            const analistas = projeto.analistas || [];
            const capacidadeProjeto = analistas.length * 8; // 8h por analista
            totalCapacidade += capacidadeProjeto;
            capacidadeUsada += capacidadeProjeto * (Math.random() * 0.3 + 0.7); // 70-100% de uso
            
            // Adicionar projeto com dados calculados
            indicadores.projetos.push({
                ...projeto,
                status: projetoStatus,
                velocidade: velocidade,
                progresso: totalTarefas > 0 ? Math.round((totalTarefasConcluidas / totalTarefas) * 100) : 0
            });
            
            // Verificar alertas críticos
            if (projetoStatus === 'atrasado') {
                indicadores.alertasCriticos.push({
                    tipo: 'critico',
                    titulo: 'Projeto Atrasado',
                    mensagem: `O projeto "${projeto.nome}" está atrasado`
                });
            }
        });
        
        // Calcular métricas finais
        indicadores.taxaConclusao = totalTarefas > 0 ? Math.round((totalTarefasConcluidas / totalTarefas) * 100) : 0;
        indicadores.capacidadeUtilizada = totalCapacidade > 0 ? Math.round((capacidadeUsada / totalCapacidade) * 100) : 0;
        
        console.log(`✅ Indicadores calculados: ${indicadores.totalProjetos} projetos`);
        
        res.json({
            success: true,
            data: indicadores
        });
        
    } catch (error) {
        console.error('❌ Erro ao buscar indicadores:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// Rota para obter lista de projetos
router.get('/projetos-lista', async (req, res) => {
    try {
        const dashboardData = getDashboardData();
        
        if (!dashboardData) {
            return res.status(404).json({
                success: false,
                message: 'Dados não encontrados'
            });
        }
        
        const projetos = dashboardData.projetos || [];
        const squads = [...new Set(projetos.map(p => p.squad).filter(Boolean))];
        
        res.json({
            success: true,
            data: {
                projetos: projetos.map(p => ({ nome: p.nome, squad: p.squad })),
                squads: squads
            }
        });
        
    } catch (error) {
        console.error('Erro ao buscar lista de projetos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// Função auxiliar para calcular status do projeto
function calcularStatusProjeto(projeto) {
    if (!projeto.prazo) return 'sem-prazo';
    
    const hoje = new Date();
    const prazo = new Date(projeto.prazo);
    const diasRestantes = Math.ceil((prazo - hoje) / (1000 * 60 * 60 * 24));
    
    if (diasRestantes < 0) return 'atrasado';
    if (diasRestantes <= 7) return 'atencao';
    return 'no-prazo';
}

module.exports = router;
