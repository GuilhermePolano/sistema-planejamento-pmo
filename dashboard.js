// Dados do dashboard carregados do MongoDB ou arquivo JSON
let dadosCompletos = {
    projetos: [],
    analistas: [],
    categorias: [],
    sustentacoes: [],
    tarefas: [],
    analistasPorFuncao: {}
};

// Função para verificar se MongoDB está disponível
async function isMongoDBAvailable() {
    try {
        const response = await fetch('/api/check-mongodb');
        const result = await response.json();
        return result.available;
    } catch (error) {
        console.log('❌ MongoDB não disponível:', error);
        return false;
    }
}

// Função para carregar dados do MongoDB ou JSON
async function carregarDadosDoJSON() {
    try {
        const mongoAvailable = await isMongoDBAvailable();
        
        if (mongoAvailable) {
            // Carregar do MongoDB
            await carregarDadosDoMongoDB();
        } else {
            // Fallback para JSON
            await carregarDadosDoJSONFile();
        }
        
        console.log('✅ Dados carregados com sucesso');
        console.log(`📊 Projetos: ${dadosCompletos.projetos.length}`);
        console.log(`👥 Analistas: ${dadosCompletos.analistas.length}`);
        console.log(`🔧 Categorias: ${dadosCompletos.categorias.length}`);
        console.log(`🔧 Sustentações: ${dadosCompletos.sustentacoes.length}`);
        console.log(`📋 Tarefas: ${dadosCompletos.tarefas.length}`);
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        // Em caso de erro, usar dados vazios
        dadosCompletos = {
            projetos: [],
            analistas: [],
            categorias: [],
            sustentacoes: [],
            tarefas: [],
            analistasPorFuncao: {}
        };
    }
}

// Função para carregar dados do MongoDB
async function carregarDadosDoMongoDB() {
    try {
        console.log('🗄️ Carregando dados do MongoDB...');

        // Fazer requisições para as APIs
        const [tarefasRes, analistasRes, projetosRes, categoriasRes, sustentacoesRes] = await Promise.all([
            fetch('/api/tarefas-analistas'),
            fetch('/api/analistas'),
            fetch('/api/projetos'),
            fetch('/api/categorias'),
            fetch('/api/sustentacoes')
        ]);

        const [tarefasData, analistasData, projetosData, categoriasData, sustentacoesData] = await Promise.all([
            tarefasRes.json(),
            analistasRes.json(),
            projetosRes.json(),
            categoriasRes.json(),
            sustentacoesRes.json()
        ]);

        // Organizar analistas por função
        const analistasPorFuncao = {};
        if (analistasData.success && analistasData.data) {
            analistasData.data.forEach(analista => {
                if (analista.funcoes && analista.funcoes.length > 0) {
                    analista.funcoes.forEach(funcao => {
                        if (!analistasPorFuncao[funcao]) {
                            analistasPorFuncao[funcao] = [];
                        }
                        analistasPorFuncao[funcao].push({
                            nome: analista.nome,
                            categoria: analista.categoria,
                            squad: analista.squad,
                            stacks: analista.stacks,
                            funcoes: analista.funcoes,
                            dataFinalUltimaTarefa: analista.dataFinalUltimaTarefa,
                            tarefasAtivas: analista.tarefasAtivas,
                            projetos: analista.projetos
                        });
                    });
                }
            });
        }

        dadosCompletos = {
            projetos: projetosData.success ? projetosData.data.map(p => ({
                nome: p.nome,
                po: p.po,
                squad: p.squad,
                status: p.status,
                dataInicio: p.dataInicio,
                dataFim: p.dataFim,
                tarefas: p.tarefas,
                analistas: p.analistas,
                tarefasDetalhadas: p.tarefasDetalhadas
            })) : [],
            analistas: analistasData.success ? analistasData.data.map(a => ({
                nome: a.nome,
                categoria: a.categoria,
                squad: a.squad,
                stacks: a.stacks,
                funcoes: a.funcoes,
                dataFinalUltimaTarefa: a.dataFinalUltimaTarefa,
                tarefasAtivas: a.tarefasAtivas,
                projetos: a.projetos
            })) : [],
            categorias: categoriasData.success ? categoriasData.data.map(c => ({
                nome: c.nome,
                analistas: c.analistas
            })) : [],
            sustentacoes: sustentacoesData.success ? sustentacoesData.data.map(s => ({
                nome: s.nome,
                po: s.po,
                squad: s.squad,
                status: s.status,
                dataInicio: s.dataInicio,
                dataFim: s.dataFim,
                tarefas: s.tarefas,
                analistas: s.analistas,
                tarefasDetalhadas: s.tarefasDetalhadas
            })) : [],
            tarefas: tarefasData.success ? tarefasData.data.map(t => ({
                projeto: t.projeto,
                resumo: t.titulo,
                tipoItem: t.tags ? t.tags[0] : '',
                chave: t.id,
                responsavel: t.analista,
                analistaNegocio: t.analista,
                dataInicial: t.dataInicio,
                dataFinal: t.dataFim,
                status: t.status,
                squad: t.squad,
                categoria: t.categoria,
                observacoes: t.observacoes,
                atrasada: false,
                periodoDemanda: 'mes_atual',
                tipoDemanda: 'projeto'
            })) : [],
            analistasPorFuncao
        };

        console.log('✅ Dados do MongoDB carregados com sucesso!');

    } catch (error) {
        console.error('❌ Erro ao carregar dados do MongoDB:', error);
        throw error;
    }
}

// Função para carregar dados do arquivo JSON (fallback)
async function carregarDadosDoJSONFile() {
    try {
        const response = await fetch('http://localhost:3000/data/dashboard-data.json');
        const data = await response.json();
        
        dadosCompletos = {
            projetos: data.projetos || [],
            analistas: data.analistas || [],
            categorias: data.categorias || [],
            sustentacoes: data.sustentacoes || [],
            tarefas: data.tarefas || [],
            analistasPorFuncao: data.analistasPorFuncao || {}
        };
        
        console.log('✅ Dados carregados do arquivo JSON');
    } catch (error) {
        console.error('❌ Erro ao carregar dados do JSON:', error);
        throw error;
    }
}

// Função para carregar tarefas dos analistas para o planejamento semanal
async function carregarTarefasAnalistasParaPlanejamento() {
    try {
        const response = await fetch('/api/tarefas-analistas');
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                return result.data;
            }
        }
        
        // Fallback: usar dados locais se a API não estiver disponível
        console.log('⚠️ API não disponível, usando dados locais...');
        return dadosCompletos.tarefas
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
        
    } catch (error) {
        console.error('❌ Erro ao carregar tarefas para planejamento:', error);
        return [];
    }
}

// Função para expandir tarefas que duram mais de uma semana
function expandirTarefasLongas(tarefas) {
    const tarefasExpandidas = [];
    
    tarefas.forEach(tarefa => {
        const dataInicio = new Date(tarefa.dataInicio);
        const dataFim = new Date(tarefa.dataFim);
        const duracaoDias = Math.ceil((dataFim - dataInicio) / (1000 * 60 * 60 * 24));
        
        if (duracaoDias > 5) { // Se dura mais de uma semana
            // Criar uma tarefa para cada dia útil
            const dataAtual = new Date(dataInicio);
            let diaUtil = 0;
            
            while (dataAtual <= dataFim && diaUtil < 5) {
                const diaSemana = dataAtual.getDay();
                if (diaSemana >= 1 && diaSemana <= 5) { // Segunda a sexta
                    tarefasExpandidas.push({
                        ...tarefa,
                        id: `${tarefa.id}_dia_${diaUtil + 1}`,
                        titulo: `${tarefa.titulo} (Dia ${diaUtil + 1})`,
                        dataInicio: new Date(dataAtual),
                        dataFim: new Date(dataAtual),
                        horasEstimadas: Math.ceil(tarefa.horasEstimadas / Math.ceil(duracaoDias / 5)),
                        progresso: Math.round((diaUtil / 5) * 100)
                    });
                    diaUtil++;
                }
                dataAtual.setDate(dataAtual.getDate() + 1);
            }
        } else {
            tarefasExpandidas.push(tarefa);
        }
    });
    
    return tarefasExpandidas;
}

let currentView = 'projetos';
let lastAnalystTab = 'analistas-tecnicos'; // Track which analyst tab was last viewed

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
        case 'analistas-tecnicos':
            lastAnalystTab = 'analistas-tecnicos';
            loadAnalystsByType('Analista Técnico');
            break;
        case 'analistas-negocio':
            lastAnalystTab = 'analistas-negocio';
            loadAnalystsByType('Analista de Negócio');
            break;
        case 'responsaveis-tecnicos':
            lastAnalystTab = 'responsaveis-tecnicos';
            loadAnalystsByType('Responsável Técnico');
            break;
        case 'categorias':
            loadCategories();
            break;
        case 'sustentacoes':
            loadSustentacoes();
            break;
        case 'planejamento-semanal':
            // A aba do planejamento semanal é apenas um link para a página dedicada
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

function loadAnalystsByType(tipoAnalista) {
    let gridId, analistas;
    
    switch(tipoAnalista) {
        case 'Analista Técnico':
            gridId = 'analistas-tecnicos-grid';
            analistas = dadosCompletos.analistasPorFuncao['Analista Técnico'] || [];
            break;
        case 'Analista de Negócio':
            gridId = 'analistas-negocio-grid';
            analistas = dadosCompletos.analistasPorFuncao['Analista de Negócio'] || [];
            break;
        case 'Responsável Técnico':
            gridId = 'responsaveis-tecnicos-grid';
            analistas = dadosCompletos.analistasPorFuncao['Responsável Técnico'] || [];
            break;
        default:
            return;
    }
    
    const grid = document.getElementById(gridId);
    grid.innerHTML = '<div class="loading">Carregando analistas...</div>';
    
    setTimeout(() => {
        grid.innerHTML = analistas.map(analista => {
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
        let html = '';
        
        // Adicionar seção de analistas por função
        if (dadosCompletos.analistasPorFuncao) {
            html += '<div class="section-title" style="margin-bottom: 20px; font-size: 1.5em; color: #2c3e50;">👥 Analistas por Função</div>';
            
            // Calcular totais de projetos por função
            const totaisPorFuncao = {};
            Object.entries(dadosCompletos.analistasPorFuncao).forEach(([funcao, analistas]) => {
                totaisPorFuncao[funcao] = analistas.reduce((total, analista) => total + analista.projetos.length, 0);
            });
            
            Object.entries(dadosCompletos.analistasPorFuncao).forEach(([funcao, analistas]) => {
                if (analistas.length > 0) {
                    const totalProjetos = totaisPorFuncao[funcao];
                    html += `
                        <div class="category-section" data-category="${funcao}">
                            <div class="category-header">
                                <div class="category-title">👤 ${funcao}</div>
                                <div class="category-count">${analistas.length} analistas • ${totalProjetos} projetos</div>
                            </div>
                            <div class="team-grid">
                                ${analistas.map(analista => {
                                    const disponivel = isAvailable(analista.dataFinalUltimaTarefa);
                                    const statusClass = disponivel ? 'status-disponivel' : 'status-ocupado';
                                    const statusText = disponivel ? 'Disponível' : 'Ocupado';
                                    
                                    return `
                                        <div class="team-member" onclick="showAnalystDetails('${analista.nome}')">
                                            <div class="member-name">${analista.nome}</div>
                                            <div class="member-role">${funcao}</div>
                                            <div class="member-status ${statusClass}">${statusText}</div>
                                            <div style="margin-top: 8px; font-size: 0.85em; color: #7f8c8d;">
                                                <strong>Stacks:</strong> ${analista.stacks && analista.stacks.length > 0 ? analista.stacks.join(', ') : 'Não informado'}<br>
                                                <strong>Disponível:</strong> ${formatDate(analista.dataFinalUltimaTarefa)}<br>
                                                <strong>Projetos:</strong> ${analista.projetos.length}
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `;
                }
            });
        }
        
        // Adicionar seção de categorias técnicas
        html += '<div class="section-title" style="margin: 30px 0 20px 0; font-size: 1.5em; color: #2c3e50;">🔧 Categorias Técnicas</div>';
        
        html += dadosCompletos.categorias.map(categoria => `
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
        
        container.innerHTML = html;
    }, 500);
}

function loadSustentacoes() {
    const grid = document.getElementById('sustentacoes-grid');
    grid.innerHTML = '<div class="loading">Carregando sustentações...</div>';
    
    setTimeout(() => {
        grid.innerHTML = dadosCompletos.sustentacoes.map(sustentacao => `
            <div class="card" onclick="showSustentacaoDetails('${sustentacao.nome}')" data-status="${sustentacao.status}" data-squad="${sustentacao.squad}">
                <div class="card-header">
                    <div class="card-title">${sustentacao.nome}</div>
                    <span class="status-badge status-${sustentacao.status.toLowerCase().replace(/\s+/g, '')}">${sustentacao.status}</span>
                </div>
                <div class="card-info"><strong>PO:</strong> ${sustentacao.po}</div>
                <div class="card-info"><strong>Squad:</strong> ${sustentacao.squad}</div>
                <div class="card-info"><strong>Período:</strong> ${formatDate(sustentacao.dataInicio)} - ${formatDate(sustentacao.dataFim)}</div>
                <div class="card-meta">
                    <div class="meta-item">
                        <div class="meta-value">${sustentacao.tarefas}</div>
                        <div class="meta-label">Tarefas</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-value">${sustentacao.analistas.length}</div>
                        <div class="meta-label">Analistas</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-value">${calcularDuracaoProjeto(sustentacao.dataInicio, sustentacao.dataFim)}</div>
                        <div class="meta-label">Dias</div>
                    </div>
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

function showSustentacaoDetails(sustentacaoName) {
    const sustentacao = dadosCompletos.sustentacoes.find(s => s.nome === sustentacaoName);
    if (!sustentacao) return;

    document.getElementById('modal-title').textContent = sustentacao.nome;
    document.getElementById('modal-body').innerHTML = `
        <div class="breadcrumb">
            <a onclick="closeModal(); showTab('sustentacoes')">Sustentações</a> > ${sustentacao.nome}
        </div>
        
        <div class="date-range">
            <strong>📅 Período da Sustentação:</strong> ${formatDate(sustentacao.dataInicio)} - ${formatDate(sustentacao.dataFim)}
            <br><strong>👤 Product Owner:</strong> ${sustentacao.po}
            <br><strong>👥 Squad:</strong> ${sustentacao.squad}
        </div>

        <div class="section">
            <div class="section-title">👥 Equipe Alocada</div>
            <div class="team-grid">
                <div class="team-member" onclick="showAnalystDetails('${sustentacao.po}')">
                    <div class="member-name">🎯 ${sustentacao.po}</div>
                    <div class="member-role">Product Owner</div>
                    <div class="member-status status-ocupado">Responsável pela Sustentação</div>
                </div>
                ${sustentacao.analistas.map(analista => {
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
            <div class="section-title">📋 Tarefas da Sustentação (${sustentacao.tarefasDetalhadas.length} principais)</div>
            <div class="task-grid">
                ${sustentacao.tarefasDetalhadas.map(tarefa => `
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

    // Encontrar sustentações em que o analista está alocado
    const sustentoesDoAnalista = dadosCompletos.sustentacoes.filter(sustentacao => 
        sustentacao.analistas.includes(analista.nome)
    );

    // Encontrar tarefas de sustentação do analista
    const tarefasSustentacaoDoAnalista = dadosCompletos.tarefas.filter(tarefa => 
        tarefa.responsavel === analista.nome && tarefa.tipoDemanda === 'Sustentação'
    );

    document.getElementById('modal-title').textContent = analista.nome;
    document.getElementById('modal-body').innerHTML = `
        <div class="breadcrumb">
            <a onclick="closeModal(); showTab('${lastAnalystTab}')">Analistas</a> > ${analista.nome}
        </div>
        
        <div class="date-range">
            <strong>👤 Analista:</strong> ${analista.nome}
            <br><strong>🔧 Categoria:</strong> ${analista.categoria}
            <br><strong>👥 Squad:</strong> ${analista.squad}
            <br><strong>🔧 Stacks:</strong> ${analista.stacks && analista.stacks.length > 0 ? analista.stacks.join(', ') : 'Não informado'}
            <br><strong>👤 Funções:</strong> ${analista.funcoes && analista.funcoes.length > 0 ? analista.funcoes.join(', ') : 'Não informado'}
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
            <div class="section-title">🔧 Sustentações Atribuídas (${sustentoesDoAnalista.length})</div>
            <div class="team-grid">
                ${sustentoesDoAnalista.map(sustentacao => {
                    const tarefasSustentacao = tarefasSustentacaoDoAnalista.filter(t => 
                        t.projeto === sustentacao.nome
                    );
                    return `
                        <div class="team-member" onclick="showSustentacaoTasksForAnalyst('${sustentacao.nome}', '${analista.nome}')">
                            <div class="member-name">🔧 ${sustentacao.nome}</div>
                            <div class="member-role">${sustentacao.squad || 'Squad não identificada'}</div>
                            <div class="member-status status-ocupado">Clique para ver tarefas (${tarefasSustentacao.length})</div>
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
                    <div class="meta-value">${sustentoesDoAnalista.length}</div>
                    <div class="meta-label">Sustentações</div>
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
            <a onclick="closeModal(); showTab('${lastAnalystTab}')">Analistas</a> > 
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

function showSustentacaoTasksForAnalyst(sustentacaoName, analystName) {
    // Encontrar tarefas de sustentação do analista específico
    const tarefasSustentacao = dadosCompletos.tarefas.filter(tarefa => 
        tarefa.projeto === sustentacaoName && 
        tarefa.responsavel === analystName && 
        tarefa.tipoDemanda === 'Sustentação'
    );

    document.getElementById('modal-title').textContent = `${analystName} - ${sustentacaoName}`;
    document.getElementById('modal-body').innerHTML = `
        <div class="breadcrumb">
            <a onclick="closeModal(); showTab('${lastAnalystTab}')">Analistas</a> > 
            <a onclick="showAnalystDetails('${analystName}')">${analystName}</a> > ${sustentacaoName}
        </div>
        
        <div class="date-range">
            <strong>👤 Analista:</strong> ${analystName}
            <br><strong>🔧 Sustentação:</strong> ${sustentacaoName}
            <br><strong>📋 Tarefas encontradas:</strong> ${tarefasSustentacao.length}
        </div>

        <div class="section">
            <div class="section-title">📋 Tarefas de Sustentação</div>
            ${tarefasSustentacao.length > 0 ? `
                <div class="task-grid">
                    ${tarefasSustentacao.map(tarefa => `
                        <div class="task-item">
                            <div class="task-title">${tarefa.resumo}</div>
                            <div class="task-meta">
                                <span><strong>Tipo do Item:</strong> ${tarefa.tipoItem}</span>
                                <span><strong>Status:</strong> ${tarefa.status}</span>
                                <span><strong>Chave:</strong> ${tarefa.chave}</span>
                                <span><strong>Início:</strong> ${formatDate(tarefa.dataInicial)}</span>
                                <span><strong>Fim:</strong> ${formatDate(tarefa.dataFinal)}</span>
                                <span><strong>Squad:</strong> ${tarefa.squad}</span>
                                <span><strong>Categoria:</strong> ${tarefa.categoria}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div class="empty-state">
                    <h3>Nenhuma tarefa de sustentação encontrada</h3>
                    <p>Este analista pode estar alocado em tarefas gerais da sustentação ou os dados detalhados não estão disponíveis.</p>
                </div>
            `}
        </div>
    `;
    
    document.getElementById('modal').style.display = 'block';
}

// Funções de filtro
function filterContent(tabName, searchTerm) {
    const cards = document.querySelectorAll(`#${tabName}-grid .card, #${tabName}-container .category-section`);
    
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        const shouldShow = text.includes(searchTerm.toLowerCase());
        card.style.display = shouldShow ? 'grid' : 'none';
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
async function updateStats() {
    try {
        // Calcular estatísticas dos dados locais
        // Projetos ativos (excluindo sustentação)
        const projetosAtivos = dadosCompletos.projetos.filter(projeto => 
            !projeto.nome.toLowerCase().includes('sustentação') && 
            !projeto.nome.toLowerCase().includes('sustentacao')
        );
        const totalProjetos = projetosAtivos.length;
        
        // Calcular tarefas de projetos (excluindo sustentação)
        let totalTarefasProjetos = 0;
        if (dadosCompletos.tarefas) {
            totalTarefasProjetos = dadosCompletos.tarefas.filter(tarefa => 
                tarefa.tipoDemanda === "Projeto"
            ).length;
        }
        
        // Calcular projetos de sustentação (da seção sustentacoes)
        const totalProjetosSustentacao = dadosCompletos.sustentacoes ? dadosCompletos.sustentacoes.length : 0;
        
        // Calcular tarefas de sustentação (da seção tarefas com tipoDemanda = "Sustentação")
        let totalTarefasSustentacao = 0;
        if (dadosCompletos.tarefas) {
            totalTarefasSustentacao = dadosCompletos.tarefas.filter(tarefa => 
                tarefa.tipoDemanda === "Sustentação"
            ).length;
        }
        
        // Calcular analistas por tipo
        const analistasTecnicos = dadosCompletos.analistasPorFuncao['Analista Técnico'] || [];
        const analistasNegocio = dadosCompletos.analistasPorFuncao['Analista de Negócio'] || [];
        const responsaveisTecnicos = dadosCompletos.analistasPorFuncao['Responsável Técnico'] || [];
        
        const totalAnalistasTecnicos = analistasTecnicos.length;
        const totalAnalistasNegocio = analistasNegocio.length;
        const totalResponsaveisTecnicos = responsaveisTecnicos.length;

        // Atualizar os elementos HTML
        document.getElementById('total-projetos').textContent = totalProjetos;
        document.getElementById('total-tarefas-projetos').textContent = totalTarefasProjetos.toLocaleString();
        document.getElementById('total-projetos-sustentacao').textContent = totalProjetosSustentacao;
        document.getElementById('total-tarefas-sustentacao').textContent = totalTarefasSustentacao;
        document.getElementById('total-analistas-tecnicos').textContent = totalAnalistasTecnicos;
        document.getElementById('total-analistas-negocio').textContent = totalAnalistasNegocio;
        document.getElementById('total-responsaveis-tecnicos').textContent = totalResponsaveisTecnicos;
        
        console.log('📊 Estatísticas atualizadas:', {
            totalProjetos,
            totalTarefasProjetos,
            totalProjetosSustentacao,
            totalTarefasSustentacao,
            totalAnalistasTecnicos,
            totalAnalistasNegocio,
            totalResponsaveisTecnicos
        });
    } catch (error) {
        console.error('❌ Erro ao calcular estatísticas:', error);
        // Valores padrão em caso de erro
        document.getElementById('total-projetos').textContent = '0';
        document.getElementById('total-tarefas-projetos').textContent = '0';
        document.getElementById('total-projetos-sustentacao').textContent = '0';
        document.getElementById('total-tarefas-sustentacao').textContent = '0';
        document.getElementById('total-analistas-tecnicos').textContent = '0';
        document.getElementById('total-analistas-negocio').textContent = '0';
        document.getElementById('total-responsaveis-tecnicos').textContent = '0';
    }
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

// Função para reprocessar dados do CSV
async function reprocessarDados() {
    try {
        console.log('🔄 Iniciando reprocessamento dos dados...');
        
        // Mostrar indicador de carregamento
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = '⏳ Processando...';
        button.disabled = true;
        
        const response = await fetch('http://localhost:3000/api/reprocess-data');
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Dados reprocessados com sucesso!');
            
            // Recarregar dados no dashboard
            await carregarDadosDoJSON();
            
            // Atualizar interface
            loadProjects();
            updateStats();
            
            // Mostrar mensagem de sucesso
            alert(`✅ Dados reprocessados com sucesso!\n\n📊 Resumo:\n- Projetos: ${result.data.projetos}\n- Analistas: ${result.data.analistas}\n- Tarefas: ${result.data.tarefas}\n- Categorias: ${result.data.categorias}`);
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('❌ Erro ao reprocessar dados:', error);
        alert(`❌ Erro ao reprocessar dados: ${error.message}`);
    } finally {
        // Restaurar botão
        const button = event.target;
        button.textContent = originalText;
        button.disabled = false;
    }
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
document.addEventListener('DOMContentLoaded', async function() {
    // Carregar dados do arquivo JSON primeiro
    await carregarDadosDoJSON();
    
    // Depois carregar a interface
    loadProjects();
    updateStats();
});