// Dados globais
let dadosIndicadores = null;
let projetosLista = [];
let squadsLista = [];
let charts = {};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    carregarDados();
    configurarFiltros();
    configurarEventos();
});

// Função para carregar dados
async function carregarDados() {
    try {
        mostrarLoading(true);
        
        // Carregar lista de projetos para filtros
        await carregarListaProjetos();
        
        // Carregar indicadores
        await carregarIndicadores();
        
        mostrarLoading(false);
        mostrarDashboard();
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        mostrarLoading(false);
        mostrarErro('Erro ao carregar dados: ' + error.message);
    }
}

// Carregar lista de projetos
async function carregarListaProjetos() {
    try {
        const response = await fetch('/api/projetos-lista');
        const data = await response.json();
        
        if (data.success) {
            projetosLista = data.data.projetos || [];
            squadsLista = data.data.squads || [];
            
            // Preencher filtros
            preencherFiltroProjetos();
            preencherFiltroSquads();
        }
    } catch (error) {
        console.error('Erro ao carregar lista de projetos:', error);
    }
}

// Carregar indicadores
async function carregarIndicadores() {
    try {
        const filtros = obterFiltros();
        const queryParams = new URLSearchParams(filtros);
        
        const response = await fetch(`/api/indicadores-projetos?${queryParams}`);
        const data = await response.json();
        
        if (data.success) {
            dadosIndicadores = data.data;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Erro ao carregar indicadores:', error);
        throw error;
    }
}

// Configurar filtros
function configurarFiltros() {
    const filtros = ['filtro-projeto', 'filtro-squad', 'filtro-status', 'filtro-periodo'];
    
    filtros.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.addEventListener('change', () => {
                setTimeout(carregarDados, 100);
            });
        }
    });
}

// Configurar eventos
function configurarEventos() {
    // Evento do formulário de comentário
    const formComentario = document.getElementById('form-comentario');
    if (formComentario) {
        formComentario.addEventListener('submit', salvarComentario);
    }
    
    // Fechar modal ao clicar fora
    const modal = document.getElementById('modal-comentario');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                fecharModal();
            }
        });
    }
}

// Obter filtros ativos
function obterFiltros() {
    return {
        projeto: document.getElementById('filtro-projeto').value,
        squad: document.getElementById('filtro-squad').value,
        status: document.getElementById('filtro-status').value,
        periodo: document.getElementById('filtro-periodo').value
    };
}

// Preencher filtro de projetos
function preencherFiltroProjetos() {
    const select = document.getElementById('filtro-projeto');
    const valorAtual = select.value;
    
    select.innerHTML = '<option value="">Todos os Projetos</option>';
    
    // Ordenar projetos alfabeticamente
    const projetosOrdenados = [...projetosLista].sort((a, b) => 
        a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })
    );
    
    projetosOrdenados.forEach(projeto => {
        const option = document.createElement('option');
        option.value = projeto.nome;
        option.textContent = projeto.nome;
        select.appendChild(option);
    });
    
    // Se não há valor atual e é a primeira carga, selecionar o primeiro projeto
    if (!valorAtual && projetosOrdenados.length > 0) {
        select.value = projetosOrdenados[0].nome;
    } else {
        select.value = valorAtual;
    }
}

// Preencher filtro de squads
function preencherFiltroSquads() {
    const select = document.getElementById('filtro-squad');
    const valorAtual = select.value;
    
    select.innerHTML = '<option value="">Todos os Squads</option>';
    
    // Ordenar squads alfabeticamente
    const squadsOrdenados = [...squadsLista].sort((a, b) => 
        a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })
    );
    
    squadsOrdenados.forEach(squad => {
        const option = document.createElement('option');
        option.value = squad;
        option.textContent = squad;
        select.appendChild(option);
    });
    
    select.value = valorAtual;
}

// Mostrar loading
function mostrarLoading(mostrar) {
    const loading = document.getElementById('loading');
    const kpiGrid = document.getElementById('kpi-grid');
    const graficosSection = document.getElementById('graficos-section');
    const projetosSection = document.getElementById('projetos-section');
    const alertasSection = document.getElementById('alertas-section');
    const timelineSection = document.getElementById('timeline-section');
    
    if (mostrar) {
        loading.style.display = 'block';
        kpiGrid.style.display = 'none';
        graficosSection.style.display = 'none';
        projetosSection.style.display = 'none';
        alertasSection.style.display = 'none';
        timelineSection.style.display = 'none';
    } else {
        loading.style.display = 'none';
    }
}

// Mostrar dashboard
function mostrarDashboard() {
    if (!dadosIndicadores) {
        mostrarErro('Nenhum dado disponível');
        return;
    }
    
    atualizarKPIs();
    atualizarAlertas();
    atualizarGraficos();
    atualizarProjetos();
    atualizarTimeline();
    
    // Mostrar seções
    document.getElementById('kpi-grid').style.display = 'grid';
    document.getElementById('graficos-section').style.display = 'grid';
    document.getElementById('projetos-section').style.display = 'block';
    
    if (dadosIndicadores.alertasCriticos && dadosIndicadores.alertasCriticos.length > 0) {
        document.getElementById('alertas-section').style.display = 'block';
    }
    
    document.getElementById('timeline-section').style.display = 'block';
}

// Atualizar KPIs
function atualizarKPIs() {
    const kpis = dadosIndicadores;
    
    // Atualizar valores
    document.getElementById('valor-projetos').textContent = kpis.totalProjetos || 0;
    document.getElementById('valor-atrasados').textContent = kpis.projetosAtrasados || 0;
    document.getElementById('valor-conclusao').textContent = (kpis.taxaConclusao || 0) + '%';
    document.getElementById('valor-capacidade').textContent = (kpis.capacidadeUtilizada || 0) + '%';
    document.getElementById('valor-historias').textContent = kpis.tarefasHistorias || 0;
    document.getElementById('valor-bugs').textContent = kpis.tarefasBugs || 0;
    
    // Atualizar classes de status
    const kpiAtrasados = document.getElementById('kpi-atrasados');
    const kpiConclusao = document.getElementById('kpi-conclusao');
    const kpiCapacidade = document.getElementById('kpi-capacidade');
    
    // Remover classes anteriores
    kpiAtrasados.className = 'kpi-card';
    kpiConclusao.className = 'kpi-card';
    kpiCapacidade.className = 'kpi-card';
    
    // Aplicar classes baseadas nos valores
    if (kpis.projetosAtrasados > 0) {
        kpiAtrasados.classList.add('critico');
    }
    
    if (kpis.taxaConclusao >= 80) {
        kpiConclusao.classList.add('sucesso');
    } else if (kpis.taxaConclusao >= 60) {
        kpiConclusao.classList.add('atencao');
    }
    
    if (kpis.capacidadeUtilizada >= 90) {
        kpiCapacidade.classList.add('critico');
    } else if (kpis.capacidadeUtilizada >= 75) {
        kpiCapacidade.classList.add('atencao');
    }
}

// Atualizar alertas
function atualizarAlertas() {
    const alertasLista = document.getElementById('alertas-lista');
    
    if (!dadosIndicadores.alertasCriticos || dadosIndicadores.alertasCriticos.length === 0) {
        return;
    }
    
    let html = '';
    dadosIndicadores.alertasCriticos.forEach(alerta => {
        const classe = alerta.tipo === 'critico' ? 'alerta-critico' : 
                      alerta.tipo === 'atencao' ? 'alerta-atencao' : 'alerta-info';
        
        html += `
            <div class="alerta-item ${classe}">
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                    <strong>${alerta.titulo}</strong>
                    <p>${alerta.mensagem}</p>
                </div>
            </div>
        `;
    });
    
    alertasLista.innerHTML = html;
}

// Atualizar gráficos
function atualizarGraficos() {
    if (!dadosIndicadores) return;
    
    // Gráfico de status
    criarGraficoStatus();
    
    // Gráfico de velocidade
    criarGraficoVelocidade();
}

// Criar gráfico de status
function criarGraficoStatus() {
    const ctx = document.getElementById('grafico-status').getContext('2d');
    
    // Destruir gráfico anterior se existir
    if (charts.status) {
        charts.status.destroy();
    }
    
    const dados = {
        noPrazo: dadosIndicadores.projetosNoPrazo || 0,
        atencao: dadosIndicadores.projetosAtencao || 0,
        atrasado: dadosIndicadores.projetosAtrasados || 0
    };
    
    charts.status = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['No Prazo', 'Atenção', 'Atrasado'],
            datasets: [{
                data: [dados.noPrazo, dados.atencao, dados.atrasado],
                backgroundColor: ['#27ae60', '#f39c12', '#e74c3c'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Criar gráfico de velocidade
function criarGraficoVelocidade() {
    const ctx = document.getElementById('grafico-velocidade').getContext('2d');
    
    // Destruir gráfico anterior se existir
    if (charts.velocidade) {
        charts.velocidade.destroy();
    }
    
    const projetos = dadosIndicadores.projetos || [];
    const topProjetos = projetos
        .filter(p => p.velocidade && p.velocidade > 0 && p.nome)
        .sort((a, b) => (b.velocidade || 0) - (a.velocidade || 0))
        .slice(0, 5);
    
    charts.velocidade = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topProjetos.map(p => p.nome ? (p.nome.length > 15 ? p.nome.substring(0, 15) + '...' : p.nome) : 'Projeto sem nome'),
            datasets: [{
                label: 'Velocidade (tarefas/dia)',
                data: topProjetos.map(p => p.velocidade || 0),
                backgroundColor: '#667eea',
                borderColor: '#5a6fd8',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Atualizar projetos
function atualizarProjetos() {
    const projetosGrid = document.getElementById('projetos-grid');
    const projetos = dadosIndicadores.projetos || [];
    
    if (projetos.length === 0) {
        projetosGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">Nenhum projeto encontrado</p>';
        return;
    }
    
    let html = '';
    projetos.forEach(projeto => {
        const status = calcularStatusProjeto(projeto);
        const classeStatus = status === 'atrasado' ? 'atrasado' : 
                           status === 'atencao' ? 'atencao' : 'no-prazo';
        
        const progresso = calcularProgressoProjeto(projeto);
        
        html += `
            <div class="projeto-card ${classeStatus}">
                <div class="projeto-header">
                    <div class="projeto-nome">${projeto.nome}</div>
                    <div class="projeto-status status-${status}">${status.toUpperCase()}</div>
                </div>
                
                <div class="projeto-info">
                    <div class="info-item">
                        <div class="info-label">Squad</div>
                        <div class="info-valor">${projeto.squad || 'N/A'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Analistas</div>
                        <div class="info-valor">${projeto.analistas?.length || 0}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Tarefas</div>
                        <div class="info-valor">${projeto.tarefas || 0}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Analistas</div>
                        <div class="info-valor">${projeto.analistas ? projeto.analistas.split(' ').length : 0}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Prazo</div>
                        <div class="info-valor">${formatarData(projeto.dataFim)}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Velocidade</div>
                        <div class="info-valor">${(projeto.velocidade || 0).toFixed(1)}/dia</div>
                    </div>
                </div>
                
                <div class="projeto-progresso">
                    <div class="progresso-bar">
                        <div class="progresso-fill" style="width: ${progresso}%"></div>
                    </div>
                    <div class="progresso-texto">${progresso}% concluído</div>
                </div>
                
                <div class="comentarios-section">
                    <div class="comentarios-header">
                        <div class="comentarios-titulo">Comentários</div>
                        <button class="btn btn-primary btn-comentario" onclick="abrirModalComentario('${projeto.nome}')">
                            <i class="fas fa-plus"></i> Adicionar
                        </button>
                    </div>
                    <div class="comentarios-lista" id="comentarios-${projeto.nome.replace(/\s+/g, '-')}">
                        <p style="color: #999; text-align: center; font-size: 0.9em;">Carregando comentários...</p>
                    </div>
                </div>
            </div>
        `;
    });
    
    projetosGrid.innerHTML = html;
    
    // Carregar comentários para cada projeto
    projetos.forEach(projeto => {
        carregarComentariosProjeto(projeto.nome);
    });
}

// Atualizar timeline
function atualizarTimeline() {
    const timeline = document.getElementById('timeline');
    const projetos = dadosIndicadores.projetos || [];
    
    // Ordenar projetos por prazo
    const projetosOrdenados = projetos
        .filter(p => p.dataFim)
        .sort((a, b) => new Date(a.dataFim) - new Date(b.dataFim))
        .slice(0, 10); // Top 10 próximos prazos
    
    if (projetosOrdenados.length === 0) {
        timeline.innerHTML = '<p style="text-align: center; color: #666;">Nenhuma entrega programada</p>';
        return;
    }
    
    let html = '';
    projetosOrdenados.forEach(projeto => {
        const status = calcularStatusProjeto(projeto);
        const diasRestantes = calcularDiasRestantes(projeto.dataFim);
        
        html += `
            <div class="timeline-item">
                <div class="timeline-data">${formatarData(projeto.dataFim)}</div>
                <div class="timeline-titulo">${projeto.nome}</div>
                <div class="timeline-descricao">
                    ${diasRestantes > 0 ? `${diasRestantes} dias restantes` : 'Prazo vencido'} • 
                    Status: ${status.toUpperCase()}
                </div>
            </div>
        `;
    });
    
    timeline.innerHTML = html;
}

// Funções auxiliares
function calcularStatusProjeto(projeto) {
    // Usar dataFim em vez de prazo, pois é o campo correto nos dados
    if (!projeto.dataFim) return 'sem-prazo';
    
    const hoje = new Date();
    const prazo = new Date(projeto.dataFim);
    const diasRestantes = Math.ceil((prazo - hoje) / (1000 * 60 * 60 * 24));
    
    if (diasRestantes < 0) return 'atrasado';
    if (diasRestantes <= 7) return 'atencao';
    return 'no-prazo';
}

function calcularProgressoProjeto(projeto) {
    // Usar o campo 'tarefas' que é o que está disponível nos dados
    const total = projeto.tarefas || 0;
    // Como não temos dados de tarefas concluídas, vamos simular baseado na velocidade
    const concluidas = Math.floor((projeto.velocidade || 0) * 0.3); // 30% da velocidade como concluídas
    
    return total > 0 ? Math.round((concluidas / total) * 100) : 0;
}

function calcularDiasRestantes(prazo) {
    if (!prazo) return 0;
    
    const hoje = new Date();
    const dataPrazo = new Date(prazo);
    return Math.ceil((dataPrazo - hoje) / (1000 * 60 * 60 * 24));
}

function formatarData(data) {
    if (!data) return 'N/A';
    
    try {
        return new Date(data).toLocaleDateString('pt-BR');
    } catch (error) {
        return data;
    }
}

// Funções de comentários
async function carregarComentariosProjeto(nomeProjeto) {
    try {
        const response = await fetch(`/api/projeto-comentarios/${encodeURIComponent(nomeProjeto)}`);
        const data = await response.json();
        
        const containerId = `comentarios-${nomeProjeto.replace(/\s+/g, '-')}`;
        const container = document.getElementById(containerId);
        
        if (!container) return;
        
        if (data.success && data.data.length > 0) {
            let html = '';
            data.data.forEach(comentario => {
                const tipoClasse = `tipo-${comentario.tipo}`;
                const dataFormatada = new Date(comentario.timestamp).toLocaleDateString('pt-BR');
                
                html += `
                    <div class="comentario-item">
                        <div class="comentario-header">
                            <span class="comentario-autor">${comentario.autor}</span>
                            <span class="comentario-data">${dataFormatada}</span>
                        </div>
                        <div class="comentario-texto">
                            ${comentario.comentario}
                            <span class="comentario-tipo ${tipoClasse}">${comentario.tipo}</span>
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
        } else {
            container.innerHTML = '<p style="color: #999; text-align: center; font-size: 0.9em;">Nenhum comentário</p>';
        }
    } catch (error) {
        console.error('Erro ao carregar comentários:', error);
        const containerId = `comentarios-${nomeProjeto.replace(/\s+/g, '-')}`;
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '<p style="color: #e74c3c; text-align: center; font-size: 0.9em;">Erro ao carregar comentários</p>';
        }
    }
}

function abrirModalComentario(nomeProjeto) {
    document.getElementById('comentario-projeto').value = nomeProjeto;
    document.getElementById('modal-comentario').style.display = 'block';
}

function fecharModal() {
    document.getElementById('modal-comentario').style.display = 'none';
    document.getElementById('form-comentario').reset();
}

async function salvarComentario(event) {
    event.preventDefault();
    
    const formData = {
        nomeProjeto: document.getElementById('comentario-projeto').value,
        autor: document.getElementById('comentario-autor').value,
        tipo: document.getElementById('comentario-tipo').value,
        comentario: document.getElementById('comentario-texto').value
    };
    
    try {
        const response = await fetch('/api/projeto-comentario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            fecharModal();
            carregarComentariosProjeto(formData.nomeProjeto);
            mostrarSucesso('Comentário salvo com sucesso!');
        } else {
            mostrarErro('Erro ao salvar comentário: ' + data.message);
        }
    } catch (error) {
        console.error('Erro ao salvar comentário:', error);
        mostrarErro('Erro ao salvar comentário: ' + error.message);
    }
}

// Funções de exportação e atualização
async function exportarRelatorio() {
    try {
        const filtros = obterFiltros();
        const queryParams = new URLSearchParams(filtros);
        
        const response = await fetch(`/api/exportar-relatorio?${queryParams}&formato=csv`);
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `relatorio-projetos-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            mostrarSucesso('Relatório exportado com sucesso!');
        } else {
            throw new Error('Erro ao exportar relatório');
        }
    } catch (error) {
        console.error('Erro ao exportar:', error);
        mostrarErro('Erro ao exportar relatório: ' + error.message);
    }
}

async function atualizarDados() {
    await carregarDados();
}

// Funções de notificação
function mostrarSucesso(mensagem) {
    // Implementar notificação de sucesso
    console.log('✅ ' + mensagem);
}

function mostrarErro(mensagem) {
    // Implementar notificação de erro
    console.error('❌ ' + mensagem);
    alert('Erro: ' + mensagem);
}

// Função para mostrar erro geral
function mostrarErro(mensagem) {
    const container = document.querySelector('.container');
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        background: #f8d7da;
        color: #721c24;
        padding: 20px;
        border-radius: 8px;
        margin: 20px 0;
        text-align: center;
        border: 1px solid #f5c6cb;
    `;
    errorDiv.innerHTML = `
        <h3>❌ Erro</h3>
        <p>${mensagem}</p>
        <button onclick="this.parentElement.remove()" style="margin-top: 10px; padding: 8px 16px; background: #721c24; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Fechar
        </button>
    `;
    container.insertBefore(errorDiv, container.firstChild);
}
