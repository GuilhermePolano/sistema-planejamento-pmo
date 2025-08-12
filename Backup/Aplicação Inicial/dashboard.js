// Dados processados da planilha do Jira
const dadosCompletos = {
    projetos: [
        {
            nome: "IA Sistema Fiergs - HUB da IA",
            po: "Guilherme Polano Corrêa",
            squad: "Squad Digital",
            dataInicio: "2025-05-13",
            dataFim: "2026-02-27",
            tarefas: 28,
            analistas: ["Leonardo Santos Rodrigues", "Roberto C. Azambuja", "Maike Naysinger Borges", "Peterson Paloschi Lima dos Santos"],
            status: "Em Desenvolvimento",
            tarefasDetalhadas: [
                { titulo: "Gestão de Permissões de Acessos", analista: "Maike Naysinger Borges", inicio: "2025-05-20", fim: "2025-07-31", status: "Em Desenvolvimento" },
                { titulo: "Chat GPT Corporativo", analista: "Leonardo Santos Rodrigues", inicio: "2025-05-28", fim: "2025-07-15", status: "Em Desenvolvimento" },
                { titulo: "Biblioteca de Prompts", analista: "Leonardo Santos Rodrigues", inicio: "2025-05-28", fim: "2025-07-04", status: "Em Desenvolvimento" },
                { titulo: "Área Administrativa", analista: "Leonardo Santos Rodrigues", inicio: "2025-05-28", fim: "2025-06-27", status: "Em Desenvolvimento" },
                { titulo: "Atas de Reuniões", analista: "Roberto C. Azambuja", inicio: "2025-05-28", fim: "2025-06-20", status: "Em Desenvolvimento" }
            ]
        },
        {
            nome: "Migração tecnológica da Central de Notas",
            po: "Andre Batista da Silva",
            squad: "Squad BPMS",
            dataInicio: "2024-07-01",
            dataFim: "2025-08-22",
            tarefas: 95,
            analistas: ["Carlos Francisco Habekost dos Santos", "Rafael Kempfer"],
            status: "Em homologação",
            tarefasDetalhadas: [
                { titulo: "Fase 2 - correções solicitadas na homologação", analista: "Carlos Francisco Habekost dos Santos", inicio: "2025-07-21", fim: "2025-08-22", status: "Em Desenvolvimento" },
                { titulo: "Alçadas de Aprovação no fluxo de pagamentos", analista: "Carlos Francisco Habekost dos Santos", inicio: "2025-04-28", fim: "2025-06-27", status: "Em Desenvolvimento" },
                { titulo: "Serviço para extrair chave de acesso das NFe", analista: "Rafael Kempfer", inicio: "2025-06-02", fim: "2025-08-07", status: "Pronto para Teste" },
                { titulo: "Migração do processo para BAW", analista: "Carlos Francisco Habekost dos Santos", inicio: "2024-07-01", fim: "2025-06-27", status: "Em homologação" }
            ]
        },
        {
            nome: "Gestão Integrada do Centro de Eventos",
            po: "Gisele da Cunha de Souza",
            squad: "Squad Oracle",
            dataInicio: "2024-03-22",
            dataFim: "2025-08-29",
            tarefas: 15,
            analistas: ["Jocimar Felau", "Nicolas dos Santos Lima", "Lucas Da Silva", "Roberto C. Azambuja"],
            status: "Em homologação",
            tarefasDetalhadas: [
                { titulo: "Módulo Agendamento de Eventos", analista: "Jocimar Felau", inicio: "2024-03-22", fim: "2025-08-29", status: "Em homologação" },
                { titulo: "Regras na limitação de datas na criação de Eventos", analista: "Nicolas dos Santos Lima", inicio: "2025-07-25", fim: "2025-07-30", status: "Em Análise Negócio" },
                { titulo: "Criação dos scripts para migração", analista: "Roberto C. Azambuja", inicio: "2025-02-17", fim: "2025-08-01", status: "Em Desenvolvimento" }
            ]
        },
        {
            nome: "Sustentação AgilInM",
            po: "Maike Naysinger Borges",
            squad: "Squad Digital",
            dataInicio: "2025-02-19",
            dataFim: "2025-07-31",
            tarefas: 45,
            analistas: ["Alexandre Riff da Costa", "Lucas dos Santos Rambo", "William Steffen Alievi"],
            status: "Produção",
            tarefasDetalhadas: [
                { titulo: "NEGOCIAÇÕES/SPA - Inclusão de Interesse no Select", analista: "Alexandre Riff da Costa", inicio: "2025-04-07", fim: "2025-07-31", status: "Em Desenvolvimento" },
                { titulo: "SPA - Rollback Impl + Ajuste no Abrir Semana", analista: "Alexandre Riff da Costa", inicio: "2025-07-16", fim: "2025-07-18", status: "Produção" },
                { titulo: "AgilInM - Desenvolvimento", analista: "William Steffen Alievi", inicio: "2025-02-19", fim: "2025-07-31", status: "Backlog" }
            ]
        },
        {
            nome: "Versionamento SGE - 2502",
            po: "Alex Melo",
            squad: "Squad SGE",
            dataInicio: "2025-07-14",
            dataFim: "2025-09-19",
            tarefas: 32,
            analistas: ["Tarso ferraz da Silva", "Quelen Rocha", "Murilo Blanco Flôr"],
            status: "Em Análise Negócio",
            tarefasDetalhadas: [
                { titulo: "Validação do Novo Ambiente PROD", analista: "Alex Melo", inicio: "2025-09-01", fim: "2025-09-19", status: "Backlog" },
                { titulo: "Preparação, Montagem e Disponibilização do Ambiente PROD", analista: "Alex Melo", inicio: "2025-08-25", fim: "2025-09-19", status: "Backlog" },
                { titulo: "Fazer produção assistida", analista: "Tarso ferraz da Silva", inicio: "2025-07-14", fim: "2025-09-19", status: "Backlog" }
            ]
        },
        {
            nome: "Squad Oracle - Sustentação",
            po: "Gisele da Cunha de Souza",
            squad: "Squad Oracle",
            dataInicio: "2024-07-15",
            dataFim: "2025-12-31",
            tarefas: 68,
            analistas: ["Lucas Mello", "Vinícius Ramos da Silva", "Claudia Kohmann da Silva"],
            status: "Em Desenvolvimento",
            tarefasDetalhadas: [
                { titulo: "Análise diária de dashboards de projetos e BPM's", analista: "Gisele da Cunha de Souza", inicio: "2024-07-15", fim: "2025-12-31", status: "Em Análise" },
                { titulo: "Planejamento Semanal Squad", analista: "Gisele da Cunha de Souza", inicio: "2024-06-17", fim: "2025-12-19", status: "Em Desenvolvimento" }
            ]
        }
    ],
    analistas: [
        {
            nome: "Leonardo Santos Rodrigues",
            categoria: "Front End",
            squad: "Squad Digital",
            dataFinalUltimaTarefa: "2026-01-30",
            projetos: ["IA Sistema Fiergs - HUB da IA", "Recrutamento e Seleção Onboarding", "SQUAD Digital - Sustentação"],
            tarefasAtivas: 8,
            disponivel: false
        },
        {
            nome: "Maike Naysinger Borges",
            categoria: "Java",
            squad: "Squad Digital",
            dataFinalUltimaTarefa: "2025-08-15",
            projetos: ["IA Sistema Fiergs - HUB da IA", "Serviços Online", "Sustentação AgilInM", "Aceleração do Desenvolvimento"],
            tarefasAtivas: 34,
            disponivel: false
        },
        {
            nome: "Carlos Francisco Habekost dos Santos",
            categoria: "BAW",
            squad: "Squad BPMS",
            dataFinalUltimaTarefa: "2025-08-22",
            projetos: ["Migração tecnológica da Central de Notas", "Automatizar Fluxo de Pagamento sem Documento Fiscal", "SQUAD BPM - Sustentação"],
            tarefasAtivas: 32,
            disponivel: false
        },
        {
            nome: "Lucas Mello",
            categoria: "Oracle Apex",
            squad: "Squad Oracle",
            dataFinalUltimaTarefa: "2025-08-08",
            projetos: ["Squad Oracle - Sustentação", "Gestão Integrada do Centro de Eventos", "APP Tracker Status de Compra"],
            tarefasAtivas: 35,
            disponivel: false
        },
        {
            nome: "Alexandre Riff da Costa",
            categoria: "PHP",
            squad: "Squad Digital",
            dataFinalUltimaTarefa: "2025-07-31",
            projetos: ["Sustentação AgilInM"],
            tarefasAtivas: 5,
            disponivel: false
        },
        {
            nome: "Roberto C. Azambuja",
            categoria: "Arquitetura",
            squad: "Squad Digital",
            dataFinalUltimaTarefa: "2026-02-27",
            projetos: ["IA Sistema Fiergs - HUB da IA", "Gestão Integrada do Centro de Eventos", "Integrações MV X Protheus"],
            tarefasAtivas: 18,
            disponivel: false
        },
        {
            nome: "Anderson Souza",
            categoria: "RPA",
            squad: "Squad RPA",
            dataFinalUltimaTarefa: "2025-09-30",
            projetos: ["Versionamento SGE - 2502", "SQUAD RPA - Sustentação", "Oferta de cursos do SENAI"],
            tarefasAtivas: 8,
            disponivel: false
        },
        {
            nome: "Quelen Rocha",
            categoria: "SGE",
            squad: "Squad SGE",
            dataFinalUltimaTarefa: "2025-08-31",
            projetos: ["Versionamento SGE - 2502", "Squad SGE - Sustentação", "Portal da Transparência - SGE"],
            tarefasAtivas: 31,
            disponivel: false
        },
        {
            nome: "Kamila",
            categoria: "Protheus",
            squad: "Squad Protheus",
            dataFinalUltimaTarefa: "2025-09-19",
            projetos: ["Migração Protheus Versão 2410", "Transforma GESUP - Melhorias no Gerenciamento de Aprovações"],
            tarefasAtivas: 36,
            disponivel: false
        },
        {
            nome: "Andre Batista da Silva",
            categoria: "PO",
            squad: "Squad Automações",
            dataFinalUltimaTarefa: "2026-01-30",
            projetos: ["Transforma GESAD - Viagens - Gestão Unificada de Aprovações", "Migração tecnológica da Central de Notas"],
            tarefasAtivas: 78,
            disponivel: false
        }
    ],
    categorias: [
        {
            nome: "Java",
            analistas: [
                { nome: "Maike Naysinger Borges", dataFinal: "2025-08-15", tarefas: 34 },
                { nome: "Eliseu Silveira Brito", dataFinal: "2025-08-15", tarefas: 8 }
            ]
        },
        {
            nome: "Front End",
            analistas: [
                { nome: "Leonardo Santos Rodrigues", dataFinal: "2026-01-30", tarefas: 8 },
                { nome: "Nicolas dos Santos Lima", dataFinal: "2025-08-01", tarefas: 6 },
                { nome: "Lucas Da Silva", dataFinal: "2025-08-05", tarefas: 3 }
            ]
        },
        {
            nome: "Oracle Apex",
            analistas: [
                { nome: "Lucas Mello", dataFinal: "2025-08-08", tarefas: 35 },
                { nome: "Vinícius Ramos da Silva", dataFinal: "2025-08-08", tarefas: 8 }
            ]
        },
        {
            nome: "BAW",
            analistas: [
                { nome: "Carlos Francisco Habekost dos Santos", dataFinal: "2025-08-22", tarefas: 32 },
                { nome: "Mario Gabriel Warnava Natel", dataFinal: "2025-08-08", tarefas: 12 }
            ]
        },
        {
            nome: "RPA",
            analistas: [
                { nome: "Anderson Souza", dataFinal: "2025-09-30", tarefas: 8 },
                { nome: "Guilherme Rodrigues de Almeida", dataFinal: "2025-08-08", tarefas: 6 },
                { nome: "Jorge Luiz de Barros Leite Tebruski", dataFinal: "2025-07-29", tarefas: 4 }
            ]
        },
        {
            nome: "PHP",
            analistas: [
                { nome: "William Steffen Alievi", dataFinal: "2025-08-01", tarefas: 15 },
                { nome: "Alexandre Riff da Costa", dataFinal: "2025-07-31", tarefas: 5 }
            ]
        },
        {
            nome: "SGE",
            analistas: [
                { nome: "Quelen Rocha", dataFinal: "2025-08-31", tarefas: 31 },
                { nome: "Tarso ferraz da Silva", dataFinal: "2025-10-31", tarefas: 22 },
                { nome: "Murilo Blanco Flôr", dataFinal: "2025-12-31", tarefas: 12 }
            ]
        },
        {
            nome: "Arquitetura",
            analistas: [
                { nome: "Roberto C. Azambuja", dataFinal: "2026-02-27", tarefas: 18 },
                { nome: "Rafael Kempfer", dataFinal: "2025-08-07", tarefas: 12 }
            ]
        },
        {
            nome: "Protheus",
            analistas: [
                { nome: "Kamila", dataFinal: "2025-09-19", tarefas: 36 },
                { nome: "Lucas Ribeiro", dataFinal: "2025-08-11", tarefas: 18 }
            ]
        }
    ]
};

let currentView = 'projetos';

// Funções de controle de UI
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');

    currentView = tabName;

    switch(tabName) {
        case 'projetos':
            loadProjects();
            break;
        case 'analistas':
            loadAnalysts();
            break;
        case 'categorias':
            loadCategories();
            break;
    }
}

// Funções de carregamento de dados
function loadProjects() {
    const grid = document.getElementById('projetos-grid');
    grid.innerHTML = '<div class="loading">Carregando projetos...</div>';
    
    setTimeout(() => {
        grid.innerHTML = dadosCompletos.projetos.map(projeto => `
            <div class="card" onclick="showProjectDetails('${projeto.nome}')" data-status="${projeto.status}" data-squad="${projeto.squad}">
                <div class="card-header">
                    <div class="card-title">${projeto.nome}</div>
                    <span class="status-badge status-${projeto.status.toLowerCase().replace(/\s+/g, '')}">${projeto.status}</span>
                </div>
                <div class="card-info"><strong>PO:</strong> ${projeto.po}</div>
                <div class="card-info"><strong>Squad:</strong> ${projeto.squad}</div>
                <div class="card-info"><strong>Período:</strong> ${formatDate(projeto.dataInicio)} - ${formatDate(projeto.dataFim)}</div>
                <div class="card-meta">
                    <div class="meta-item">
                        <div class="meta-value">${projeto.tarefas}</div>
                        <div class="meta-label">Tarefas</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-value">${projeto.analistas.length}</div>
                        <div class="meta-label">Analistas</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-value">${calcularDuracaoProjeto(projeto.dataInicio, projeto.dataFim)}</div>
                        <div class="meta-label">Dias</div>
                    </div>
                </div>
            </div>
        `).join('');
    }, 500);
}

function loadAnalysts() {
    const grid = document.getElementById('analistas-grid');
    grid.innerHTML = '<div class="loading">Carregando analistas...</div>';
    
    setTimeout(() => {
        grid.innerHTML = dadosCompletos.analistas.map(analista => {
            const disponivel = isAvailable(analista.dataFinalUltimaTarefa);
            const statusClass = disponivel ? 'status-disponivel' : 'status-ocupado';
            const statusText = disponivel ? 'Disponível' : 'Ocupado';
            
            return `
                <div class="card" onclick="showAnalystDetails('${analista.nome}')" data-availability="${disponivel ? 'disponivel' : 'ocupado'}" data-category="${analista.categoria}">
                    <div class="card-header">
                        <div class="card-title">${analista.nome}</div>
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                    <div class="card-info"><strong>Categoria:</strong> ${analista.categoria}</div>
                    <div class="card-info"><strong>Squad:</strong> ${analista.squad}</div>
                    <div class="card-info"><strong>Disponível em:</strong> ${formatDate(analista.dataFinalUltimaTarefa)}</div>
                    <div class="card-meta">
                        <div class="meta-item">
                            <div class="meta-value">${analista.projetos.length}</div>
                            <div class="meta-label">Projetos</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-value">${analista.tarefasAtivas}</div>
                            <div class="meta-label">Tarefas</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-value">${calcularDiasAteDisponibilidade(analista.dataFinalUltimaTarefa)}</div>
                            <div class="meta-label">Dias</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }, 500);
}

function loadCategories() {
    const container = document.getElementById('categorias-container');
    container.innerHTML = '<div class="loading">Carregando categorias...</div>';
    
    setTimeout(() => {
        container.innerHTML = dadosCompletos.categorias.map(categoria => `
            <div class="category-section" data-category="${categoria.nome}">
                <div class="category-header">
                    <div class="category-title">🔧 ${categoria.nome}</div>
                    <div class="category-count">${categoria.analistas.length} analistas</div>
                </div>
                <div class="team-grid">
                    ${categoria.analistas.map(analista => {
                        const disponivel = isAvailable(analista.dataFinal);
                        const statusClass = disponivel ? 'status-disponivel' : 'status-ocupado';
                        const statusText = disponivel ? 'Disponível' : 'Ocupado';
                        
                        return `
                            <div class="team-member" onclick="showAnalystDetails('${analista.nome}')">
                                <div class="member-name">${analista.nome}</div>
                                <div class="member-role">${categoria.nome} Developer</div>
                                <div class="member-status ${statusClass}">${statusText}</div>
                                <div style="margin-top: 8px; font-size: 0.85em; color: #7f8c8d;">
                                    <strong>Disponível:</strong> ${formatDate(analista.dataFinal)}<br>
                                    <strong>Tarefas:</strong> ${analista.tarefas}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `).join('');
    }, 500);
}

// Funções de exibição de detalhes (modais)
function showProjectDetails(projectName) {
    const projeto = dadosCompletos.projetos.find(p => p.nome === projectName);
    if (!projeto) return;

    document.getElementById('modal-title').textContent = projeto.nome;
    document.getElementById('modal-body').innerHTML = `
        <div class="breadcrumb">
            <a onclick="closeModal(); showTab('projetos')">Projetos</a> > ${projeto.nome}
        </div>
        
        <div class="date-range">
            <strong>📅 Período do Projeto:</strong> ${formatDate(projeto.dataInicio)} - ${formatDate(projeto.dataFim)}
            <br><strong>�� Product Owner:</strong> ${projeto.po}
            <br><strong>👥 Squad:</strong> ${projeto.squad}
        </div>

        <div class="section">
            <div class="section-title">👥 Equipe Alocada</div>
            <div class="team-grid">
                <div class="team-member" onclick="showAnalystDetails('${projeto.po}')">
                    <div class="member-name">🎯 ${projeto.po}</div>
                    <div class="member-role">Product Owner</div>
                    <div class="member-status status-ocupado">Responsável pelo Projeto</div>
                </div>
                ${projeto.analistas.map(analista => {
                    const analistaData = dadosCompletos.analistas.find(a => a.nome === analista);
                    const disponivel = analistaData ? isAvailable(analistaData.dataFinalUltimaTarefa) : false;
                    const statusClass = disponivel ? 'status-disponivel' : 'status-ocupado';
                    const statusText = disponivel ? 'Disponível' : 'Ocupado';
                    
                    return `
                        <div class="team-member" onclick="showAnalystDetails('${analista}')">
                            <div class="member-name">💻 ${analista}</div>
                            <div class="member-role">${analistaData ? analistaData.categoria : 'Desenvolvedor'}</div>
                            <div class="member-status ${statusClass}">${statusText}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>

        <div class="section">
            <div class="section-title">📋 Tarefas do Projeto (${projeto.tarefasDetalhadas.length} principais)</div>
            <div class="task-grid">
                ${projeto.tarefasDetalhadas.map(tarefa => `
                    <div class="task-item">
                        <div class="task-title">${tarefa.titulo}</div>
                        <div class="task-meta">
                            <span><strong>Analista:</strong> ${tarefa.analista}</span>
                            <span><strong>Status:</strong> ${tarefa.status}</span>
                            <span><strong>Período:</strong> ${formatDate(tarefa.inicio)} - ${formatDate(tarefa.fim)}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.getElementById('modal').style.display = 'block';
}

function showAnalystDetails(analystName) {
    const analista = dadosCompletos.analistas.find(a => a.nome === analystName);
    if (!analista) return;

    const disponivel = isAvailable(analista.dataFinalUltimaTarefa);
    const statusClass = disponivel ? 'status-disponivel' : 'status-ocupado';
    const statusText = disponivel ? 'Disponível' : 'Ocupado';

    document.getElementById('modal-title').textContent = analista.nome;
    document.getElementById('modal-body').innerHTML = `
        <div class="breadcrumb">
            <a onclick="closeModal(); showTab('analistas')">Analistas</a> > ${analista.nome}
        </div>
        
        <div class="date-range">
            <strong>👤 Analista:</strong> ${analista.nome}
            <br><strong>🔧 Categoria:</strong> ${analista.categoria}
            <br><strong>👥 Squad:</strong> ${analista.squad}
            <br><strong>�� Disponível em:</strong> ${formatDate(analista.dataFinalUltimaTarefa)}
            <br><strong>📊 Status:</strong> <span class="${statusClass}">${statusText}</span>
        </div>

        <div class="section">
            <div class="section-title">📋 Projetos Atribuídos (${analista.projetos.length})</div>
            <div class="team-grid">
                ${analista.projetos.map(projectName => {
                    const projeto = dadosCompletos.projetos.find(p => p.nome === projectName);
                    return `
                        <div class="team-member" onclick="showProjectTasksForAnalyst('${projectName}', '${analista.nome}')">
                            <div class="member-name">📁 ${projectName}</div>
                            <div class="member-role">${projeto ? projeto.squad : 'Squad não identificada'}</div>
                            <div class="member-status status-ocupado">Clique para ver tarefas</div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>

        <div class="section">
            <div class="section-title">📊 Estatísticas</div>
            <div class="card-meta">
                <div class="meta-item">
                    <div class="meta-value">${analista.projetos.length}</div>
                    <div class="meta-label">Projetos</div>
                </div>
                <div class="meta-item">
                    <div class="meta-value">${analista.tarefasAtivas}</div>
                    <div class="meta-label">Tarefas Ativas</div>
                </div>
                <div class="meta-item">
                    <div class="meta-value">${calcularDiasAteDisponibilidade(analista.dataFinalUltimaTarefa)}</div>
                    <div class="meta-label">Dias até Disponibilidade</div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modal').style.display = 'block';
}

function showProjectTasksForAnalyst(projectName, analystName) {
    const projeto = dadosCompletos.projetos.find(p => p.nome === projectName);
    const tarefasDoAnalista = projeto ? projeto.tarefasDetalhadas.filter(t => t.analista === analystName) : [];

    document.getElementById('modal-title').textContent = `${analystName} - ${projectName}`;
    document.getElementById('modal-body').innerHTML = `
        <div class="breadcrumb">
            <a onclick="closeModal(); showTab('analistas')">Analistas</a> > 
            <a onclick="showAnalystDetails('${analystName}')">${analystName}</a> > ${projectName}
        </div>
        
        <div class="date-range">
            <strong>👤 Analista:</strong> ${analystName}
            <br><strong>📁 Projeto:</strong> ${projectName}
            <br><strong>📋 Tarefas encontradas:</strong> ${tarefasDoAnalista.length}
        </div>

        <div class="section">
            <div class="section-title">📋 Tarefas Específicas</div>
            ${tarefasDoAnalista.length > 0 ? `
                <div class="task-grid">
                    ${tarefasDoAnalista.map(tarefa => `
                        <div class="task-item">
                            <div class="task-title">${tarefa.titulo}</div>
                            <div class="task-meta">
                                <span><strong>Status:</strong> ${tarefa.status}</span>
                                <span><strong>Início:</strong> ${formatDate(tarefa.inicio)}</span>
                                <span><strong>Fim:</strong> ${tarefa.fim}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div class="empty-state">
                    <h3>Nenhuma tarefa específica encontrada</h3>
                    <p>Este analista pode estar alocado em tarefas gerais do projeto ou os dados detalhados não estão disponíveis.</p>
                </div>
            `}
        </div>
    `;
}

// Funções de filtro
function filterContent(tabName, searchTerm) {
    const cards = document.querySelectorAll(`#${tabName}-grid .card, #${tabName}-container .category-section`);
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(searchTerm.toLowerCase()) ? 'grid' : 'none'; // Use 'grid' para manter o layout de grid
    });
}

function filterByStatus(tabName, status) {
    const cards = document.querySelectorAll(`#${tabName}-grid .card`);
    cards.forEach(card => {
        if (!status || card.dataset.status === status) {
            card.style.display = 'grid'; // Use 'grid' para manter o layout de grid
        } else {
            card.style.display = 'none';
        }
    });
}

function filterBySquad(tabName, squad) {
    const cards = document.querySelectorAll(`#${tabName}-grid .card`);
    cards.forEach(card => {
        if (!squad || card.dataset.squad === squad) {
            card.style.display = 'grid'; // Use 'grid' para manter o layout de grid
        } else {
            card.style.display = 'none';
        }
    });
}

function filterByAvailability(tabName, availability) {
    const cards = document.querySelectorAll(`#${tabName}-grid .card`);
    cards.forEach(card => {
        if (!availability || card.dataset.availability === availability) {
            card.style.display = 'grid'; // Use 'grid' para manter o layout de grid
        } else {
            card.style.display = 'none';
        }
    });
}

function filterByCategory(tabName, category) {
    const cards = document.querySelectorAll(`#${tabName}-grid .card`);
    cards.forEach(card => {
        if (!category || card.dataset.category === category) {
            card.style.display = 'grid'; // Use 'grid' para manter o layout de grid
        } else {
            card.style.display = 'none';
        }
    });
}

// Funções auxiliares de data e cálculo
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString + "T00:00:00"); // Adiciona T00:00:00 para evitar problemas de fuso horário
    return date.toLocaleDateString('pt-BR');
}

function isAvailable(dateString) {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zera hora para comparar apenas a data
    const availabilityDate = new Date(dateString + "T00:00:00"); // Zera hora para comparar apenas a data
    return availabilityDate <= today;
}

function calcularDuracaoProjeto(inicio, fim) {
    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);
    const diffTime = Math.abs(dataFim - dataInicio);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function calcularDiasAteDisponibilidade(dataFinal) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zera hora para comparar apenas a data
    const dataDisponibilidade = new Date(dataFinal + "T00:00:00"); // Zera hora para comparar apenas a data
    const diffTime = dataDisponibilidade - hoje;
    const dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return dias > 0 ? dias : 0;
}

// Funções de controle do modal
function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
}

// Funções para os botões do header
function updateStats() {
    const totalProjetos = dadosCompletos.projetos.length;
    const totalAnalistas = dadosCompletos.analistas.length;
    const totalTarefas = dadosCompletos.analistas.reduce((sum, a) => sum + a.tarefasAtivas, 0);
    const analistasDisponiveis = dadosCompletos.analistas.filter(a => isAvailable(a.dataFinalUltimaTarefa)).length;
    const percentualDisponibilidade = ((analistasDisponiveis / totalAnalistas) * 100).toFixed(1);

    document.getElementById('total-projetos').textContent = totalProjetos;
    document.getElementById('total-analistas').textContent = totalAnalistas;
    document.getElementById('total-tarefas').textContent = totalTarefas.toLocaleString();
    document.getElementById('tarefas-atrasadas').textContent = `${percentualDisponibilidade}%`;
    document.querySelector('#tarefas-atrasadas').nextElementSibling.textContent = 'Analistas Disponíveis';
}

function exportarDados() {
    const dadosExport = {
        projetos: dadosCompletos.projetos.map(p => ({
            nome: p.nome,
            po: p.po,
            squad: p.squad,
            inicio: p.dataInicio,
            fim: p.dataFim,
            tarefas: p.tarefas,
            analistas: p.analistas.join(', ')
        })),
        analistas: dadosCompletos.analistas.map(a => ({
            nome: a.nome,
            categoria: a.categoria,
            squad: a.squad,
            disponibilidade: a.dataFinalUltimaTarefa,
            projetos: a.projetos.join(', '),
            tarefas: a.tarefasAtivas
        }))
    };

    const dataStr = JSON.stringify(dadosExport, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dashboard-pmo-dados.json';
    link.click();
}

function gerarRelatorioCapacidade() {
    const relatorio = {
        resumoGeral: {
            totalProjetos: dadosCompletos.projetos.length,
            totalAnalistas: dadosCompletos.analistas.length,
            analistasDisponiveis: dadosCompletos.analistas.filter(a => isAvailable(a.dataFinalUltimaTarefa)).length,
            analistasOcupados: dadosCompletos.analistas.filter(a => !isAvailable(a.dataFinalUltimaTarefa)).length
        },
        porCategoria: dadosCompletos.categorias.map(cat => ({
            categoria: cat.nome,
            total: cat.analistas.length,
            disponiveis: cat.analistas.filter(a => isAvailable(a.dataFinal)).length,
            proximaDisponibilidade: cat.analistas.reduce((earliest, a) => {
                const data = new Date(a.dataFinal);
                return !earliest || data < earliest ? data : earliest;
            }, null)
        })),
        projetosComMaiorCarga: dadosCompletos.projetos
            .sort((a, b) => b.tarefas - a.tarefas)
            .slice(0, 5)
            .map(p => ({
                projeto: p.nome,
                tarefas: p.tarefas,
                analistas: p.analistas.length,
                po: p.po
            }))
    };
    return relatorio;
}

function mostrarRelatorioCapacidade() {
    const relatorio = gerarRelatorioCapacidade();
    
    document.getElementById('modal-title').textContent = 'Relatório de Capacidade';
    document.getElementById('modal-body').innerHTML = `
        <div class="section">
            <div class="section-title">📊 Resumo Geral</div>
            <div class="card-meta">
                <div class="meta-item">
                    <div class="meta-value">${relatorio.resumoGeral.totalProjetos}</div>
                    <div class="meta-label">Projetos Ativos</div>
                </div>
                <div class="meta-item">
                    <div class="meta-value">${relatorio.resumoGeral.totalAnalistas}</div>
                    <div class="meta-label">Total Analistas</div>
                </div>
                <div class="meta-item">
                    <div class="meta-value">${relatorio.resumoGeral.analistasDisponiveis}</div>
                    <div class="meta-label">Disponíveis</div>
                </div>
                <div class="meta-item">
                    <div class="meta-value">${relatorio.resumoGeral.analistasOcupados}</div>
                    <div class="meta-label">Ocupados</div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">🔧 Capacidade por Categoria</div>
            <div class="task-grid">
                ${relatorio.porCategoria.map(cat => `
                    <div class="task-item">
                        <div class="task-title">${cat.categoria}</div>
                        <div class="task-meta">
                            <span><strong>Total:</strong> ${cat.total}</span>
                            <span><strong>Disponíveis:</strong> ${cat.disponiveis}</span>
                            <span><strong>Próxima disponibilidade:</strong> ${cat.proximaDisponibilidade ? formatDate(cat.proximaDisponibilidade.toISOString()) : 'N/A'}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="section">
            <div class="section-title">🎯 Top 5 Projetos com Maior Carga</div>
            <div class="task-grid">
                ${relatorio.projetosComMaiorCarga.map(proj => `
                    <div class="task-item">
                        <div class="task-title">${proj.projeto}</div>
                        <div class="task-meta">
                            <span><strong>Tarefas:</strong> ${proj.tarefas}</span>
                            <span><strong>Analistas:</strong> ${proj.analistas}</span>
                            <span><strong>PO:</strong> ${proj.po}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.getElementById('modal').style.display = 'block';
}

function mostrarAlertasCapacidade() {
    const alertas = [];
    
    dadosCompletos.analistas.forEach(analista => {
        if (analista.tarefasAtivas > 30) {
            alertas.push({
                tipo: 'sobrecarga',
                mensagem: `${analista.nome} tem ${analista.tarefasAtivas} tarefas ativas`,
                prioridade: 'alta'
            });
        }
    });

    dadosCompletos.projetos.forEach(projeto => {
        if (projeto.analistas.length > 6) {
            alertas.push({
                tipo: 'equipe-grande',
                mensagem: `${projeto.nome} tem ${projeto.analistas.length} analistas alocados`,
                prioridade: 'media'
            });
        }
        if (projeto.tarefas > 50) {
            alertas.push({
                tipo: 'alto-numero-tarefas',
                mensagem: `${projeto.nome} tem ${projeto.tarefas} tarefas no total`,
                prioridade: 'media'
            });
        }
    });

    dadosCompletos.categorias.forEach(categoria => {
        const disponiveis = categoria.analistas.filter(a => isAvailable(a.dataFinal)).length;
        if (disponiveis === 0 && categoria.analistas.length > 0) {
            alertas.push({
                tipo: 'sem-recursos',
                mensagem: `Categoria ${categoria.nome} não tem analistas disponíveis`,
                prioridade: 'alta'
            });
        }
    });

    return alertas;
}

function mostrarAlertas() {
    const alertas = mostrarAlertasCapacidade();
    
    document.getElementById('modal-title').textContent = 'Alertas de Capacidade';
    document.getElementById('modal-body').innerHTML = `
        <div class="section">
            <div class="section-title">⚠️ Alertas Identificados (${alertas.length})</div>
            ${alertas.length > 0 ? `
                <div class="task-grid">
                    ${alertas.map(alerta => `
                        <div class="task-item" style="border-left-color: ${alerta.prioridade === 'alta' ? '#e74c3c' : '#f39c12'};">
                            <div class="task-title">
                                ${alerta.prioridade === 'alta' ? '🔴' : '🟡'} ${alerta.tipo.toUpperCase().replace(/-/g, ' ')}
                            </div>
                            <div class="task-meta">
                                <span>${alerta.mensagem}</span>
                                <span><strong>Prioridade:</strong> ${alerta.prioridade}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div class="empty-state">
                    <h3>✅ Nenhum alerta crítico</h3>
                    <p>A capacidade da equipe está dentro dos parâmetros normais.</p>
                </div>
            `}
        </div>

        <div class="section">
            <div class="section-title">📋 Recomendações</div>
            <div class="task-grid">
                <div class="task-item">
                    <div class="task-title">🔄 Redistribuição de Carga</div>
                    <div class="task-meta">
                        <span>Considere redistribuir tarefas de analistas sobrecarregados</span>
                    </div>
                </div>
                <div class="task-item">
                    <div class="task-title">📈 Planejamento de Recursos</div>
                    <div class="task-meta">
                        <span>Identifique necessidades futuras de contratação ou treinamento</span>
                    </div>
                </div>
                <div class="task-item">
                    <div class="task-title">⏰ Revisão de Prazos</div>
                    <div class="task-meta">
                        <span>Reavalie cronogramas de projetos com base na capacidade atual</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modal').style.display = 'block';
}

function criarTimelineProjetos() {
    return dadosCompletos.projetos.map(projeto => {
        const inicio = new Date(projeto.dataInicio);
        const fim = new Date(projeto.dataFim);
        const hoje = new Date();
        const duracaoTotal = fim - inicio;
        let progressoAtual = 0;
        if (duracaoTotal > 0) {
            progressoAtual = Math.min(100, Math.max(0, ((hoje - inicio) / duracaoTotal) * 100));
        } else if (hoje >= fim) {
            progressoAtual = 100;
        }

        return {
            nome: projeto.nome,
            inicio: formatDate(projeto.dataInicio),
            fim: formatDate(projeto.dataFim),
            progresso: Math.round(progressoAtual),
            status: projeto.status
        };
    });
}

function mostrarTimeline() {
    const timeline = criarTimelineProjetos();
    
    document.getElementById('modal-title').textContent = 'Timeline de Projetos';
    document.getElementById('modal-body').innerHTML = `
        <div class="section">
            <div class="section-title">📅 Cronograma de Projetos</div>
            <div class="task-grid">
                ${timeline.map(item => `
                    <div class="task-item">
                        <div class="task-title">${item.nome}</div>
                        <div class="task-meta">
                            <span><strong>Início:</strong> ${item.inicio}</span>
                            <span><strong>Fim:</strong> ${item.fim}</span>
                            <span><strong>Status:</strong> ${item.status}</span>
                        </div>
                        <div style="margin-top: 10px;">
                            <div style="background: #ecf0f1; height: 8px; border-radius: 4px; overflow: hidden;">
                                <div style="background: ${item.progresso > 75 ? '#27ae60' : item.progresso > 50 ? '#f39c12' : '#e74c3c'}; height: 100%; width: ${item.progresso}%; transition: width 0.3s ease;"></div>
                            </div>
                            <div style="font-size: 0.8em; color: #7f8c8d; margin-top: 5px;">Progresso: ${item.progresso}%</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.getElementById('modal').style.display = 'block';
}

function imprimirRelatorio() {
    const relatorio = gerarRelatorioCapacidade();
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Relatório PMO - ${new Date().toLocaleDateString('pt-BR')}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .section { margin-bottom: 25px; }
                .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #ccc; padding-bottom: 5px; }
                .stats { display: flex; justify-content: space-around; margin: 20px 0; }
                .stat { text-align: center; }
                .stat-number { font-size: 24px; font-weight: bold; color: #667eea; }
                .table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .table th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Relatório PMO - Dashboard de Recursos</h1>
                <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
            </div>
            
            <div class="section">
                <div class="section-title">Resumo Executivo</div>
                <div class="stats">
                    <div class="stat">
                        <div class="stat-number">${relatorio.resumoGeral.totalProjetos}</div>
                        <div>Projetos Ativos</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">${relatorio.resumoGeral.totalAnalistas}</div>
                        <div>Total Analistas</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">${relatorio.resumoGeral.analistasDisponiveis}</div>
                        <div>Disponíveis</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">${relatorio.resumoGeral.analistasOcupados}</div>
                        <div>Ocupados</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Capacidade por Categoria</div>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Categoria</th>
                            <th>Total Analistas</th>
                            <th>Disponíveis</th>
                            <th>Taxa de Ocupação</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${relatorio.porCategoria.map(cat => `
                            <tr>
                                <td>${cat.categoria}</td>
                                <td>${cat.total}</td>
                                <td>${cat.disponiveis}</td>
                                <td>${Math.round(((cat.total - cat.disponiveis) / cat.total) * 100)}%</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <div class="section-title">Projetos com Maior Demanda</div>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Projeto</th>
                            <th>Tarefas</th>
                            <th>Analistas</th>
                            <th>Product Owner</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${relatorio.projetosComMaiorCarga.map(proj => `
                            <tr>
                                <td>${proj.projeto}</td>
                                <td>${proj.tarefas}</td>
                                <td>${proj.analistas}</td>
                                <td>${proj.po}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

function analisePreditivaCapacidade() {
    const proximosMeses = [];
    const hoje = new Date();
    
    for (let i = 0; i < 6; i++) {
        const mes = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
        const analistasLivres = dadosCompletos.analistas.filter(a => {
            const dataFinal = new Date(a.dataFinalUltimaTarefa);
            return dataFinal <= mes;
        }).length;
        
        proximosMeses.push({
            mes: mes.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
            analistasDisponiveis: analistasLivres,
            capacidadeTotal: dadosCompletos.analistas.length,
            percentualDisponibilidade: Math.round((analistasLivres / dadosCompletos.analistas.length) * 100)
        });
    }
    
    return proximosMeses;
}

function gerarMatrizCompetencias() {
    const matriz = {};
    
    dadosCompletos.categorias.forEach(categoria => {
        // Para simular níveis de senioridade, usei um critério baseado no número de tarefas
        // Você pode ajustar isso para um campo 'nivel' nos seus dados de analistas
        matriz[categoria.nome] = {
            junior: categoria.analistas.filter(a => a.tarefas <= 15).length,
            pleno: categoria.analistas.filter(a => a.tarefas > 15 && a.tarefas <= 30).length,
            senior: categoria.analistas.filter(a => a.tarefas > 30).length,
            total: categoria.analistas.length
        };
    });
    
    return matriz;
}

function analisarRiscosProjetos() {
    return dadosCompletos.projetos.map(projeto => {
        const hoje = new Date();
        const dataFim = new Date(projeto.dataFim);
        const diasRestantes = Math.ceil((dataFim - hoje) / (1000 * 60 * 60 * 24));
        
        let nivelRisco = 'baixo';
        let fatoresRisco = [];
        
        if (diasRestantes < 30 && diasRestantes > 0) { // Projetos com menos de 30 dias para terminar
            nivelRisco = 'alto';
            fatoresRisco.push('Prazo crítico (menos de 30 dias)');
        } else if (diasRestantes <= 0 && projeto.status !== "Produção") { // Projetos atrasados
            nivelRisco = 'alto';
            fatoresRisco.push('Projeto atrasado');
        }
        
        if (projeto.analistas.length > 6) { // Exemplo de regra para equipe grande
            nivelRisco = nivelRisco === 'alto' ? 'alto' : 'medio';
            fatoresRisco.push('Equipe muito grande (comunicação complexa)');
        }
        
        if (projeto.tarefas > 50) { // Exemplo de regra para alto número de tarefas
            nivelRisco = nivelRisco === 'alto' ? 'alto' : 'medio';
            fatoresRisco.push('Alto número de tarefas');
        }
        
        const analistasOcupados = projeto.analistas.filter(analista => {
            const analistaData = dadosCompletos.analistas.find(a => a.nome === analista);
            return analistaData && !isAvailable(analistaData.dataFinalUltimaTarefa);
        }).length;
        
        if (analistasOcupados === projeto.analistas.length && projeto.analistas.length > 0) {
            nivelRisco = 'alto';
            fatoresRisco.push('Todos os analistas ocupados');
        }
        
        return {
            projeto: projeto.nome,
            nivelRisco,
            fatoresRisco,
            diasRestantes,
            recomendacoes: gerarRecomendacoesProjeto(projeto, nivelRisco, fatoresRisco)
        };
    });
}

function gerarRecomendacoesProjeto(projeto, nivelRisco, fatoresRisco) {
    const recomendacoes = [];
    
    if (nivelRisco === 'alto') {
        recomendacoes.push('Revisar cronograma e prioridades');
        recomendacoes.push('Considerar alocação de recursos adicionais');
        recomendacoes.push('Aumentar frequência de reuniões de status');
    }
    
    if (fatoresRisco.includes('Equipe muito grande (comunicação complexa)')) {
        recomendacoes.push('Implementar estrutura de sub-equipes');
        recomendacoes.push('Definir pontos focais por área técnica');
    }
    
    if (fatoresRisco.includes('Alto número de tarefas')) {
        recomendacoes.push('Revisar escopo e priorizar tarefas críticas');
        recomendacoes.push('Considerar divisão em fases menores');
    }
    
    return recomendacoes;
}

function mostrarAnalisePreditiva() {
    const analise = analisePreditivaCapacidade();
    const matriz = gerarMatrizCompetencias();
    const riscos = analisarRiscosProjetos();
    
    document.getElementById('modal-title').textContent = 'Análise Preditiva e Riscos';
    document.getElementById('modal-body').innerHTML = `
        <div class="section">
            <div class="section-title">📈 Projeção de Capacidade (Próximos 6 Meses)</div>
            <div class="task-grid">
                ${analise.map(mes => `
                    <div class="task-item">
                        <div class="task-title">${mes.mes}</div>
                        <div class="task-meta">
                            <span><strong>Disponíveis:</strong> ${mes.analistasDisponiveis}/${mes.capacidadeTotal}</span>
                            <span><strong>Capacidade:</strong> ${mes.percentualDisponibilidade}%</span>
                        </div>
                        <div style="margin-top: 8px;">
                            <div style="background: #ecf0f1; height: 6px; border-radius: 3px; overflow: hidden;">
                                <div style="background: ${mes.percentualDisponibilidade > 70 ? '#27ae60' : mes.percentualDisponibilidade > 40 ? '#f39c12' : '#e74c3c'}; height: 100%; width: ${mes.percentualDisponibilidade}%; transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="section">
            <div class="section-title">🎯 Matriz de Competências</div>
            <div class="task-grid">
                ${Object.keys(matriz).map(categoria => `
                    <div class="task-item">
                        <div class="task-title">${categoria}</div>
                        <div class="task-meta">
                            <span><strong>Júnior:</strong> ${matriz[categoria].junior}</span>
                            <span><strong>Pleno:</strong> ${matriz[categoria].pleno}</span>
                            <span><strong>Sênior:</strong> ${matriz[categoria].senior}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="section">
            <div class="section-title">⚠️ Análise de Riscos dos Projetos</div>
            <div class="task-grid">
                ${riscos.map(risco => `
                    <div class="task-item" style="border-left-color: ${risco.nivelRisco === 'alto' ? '#e74c3c' : risco.nivelRisco === 'medio' ? '#f39c12' : '#27ae60'};">
                        <div class="task-title">
                            ${risco.nivelRisco === 'alto' ? '🔴' : risco.nivelRisco === 'medio' ? '🟡' : '��'} 
                            ${risco.projeto}
                        </div>
                        <div class="task-meta">
                            <span><strong>Risco:</strong> ${risco.nivelRisco.toUpperCase()}</span>
                            <span><strong>Dias restantes:</strong> ${risco.diasRestantes}</span>
                        </div>
                        ${risco.fatoresRisco.length > 0 ? `
                            <div style="margin-top: 10px; font-size: 0.9em;">
                                <strong>Fatores de risco:</strong>
                                <ul style="margin: 5px 0 0 20px; color: #7f8c8d;">
                                    ${risco.fatoresRisco.map(fator => `<li>${fator}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        ${risco.recomendacoes.length > 0 ? `
                            <div style="margin-top: 10px; font-size: 0.9em;">
                                <strong>Recomendações:</strong>
                                <ul style="margin: 5px 0 0 20px; color: #27ae60;">
                                    ${risco.recomendacoes.map(rec => `<li>${rec}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.getElementById('modal').style.display = 'block';
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    loadProjects();
    updateStats();
});