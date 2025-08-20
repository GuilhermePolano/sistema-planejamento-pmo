/**
 * Filter Manager - Módulo para gerenciamento de filtros
 * Extraído do planejamento-semanal.js para melhor organização
 */

class FilterManager {
    constructor() {
        this.analysts = [];
        this.projects = [];
        this.projectAnalystMapping = {}; // Mapeamento projeto -> analistas
        this.analystProjectMapping = {}; // Mapeamento analista -> projetos
    }

    // Função para carregar analistas
    async loadAnalysts() {
        try {
            const response = await fetch('/api/analistas');
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    // Ordenar analistas em ordem alfabética
                    this.analysts = result.data.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
                    
                    const select = document.getElementById('filtroAnalista');
                    
                    // Limpar opções existentes
                    select.innerHTML = '<option value="">Todos os Analistas</option>';
                    
                    this.analysts.forEach(analyst => {
                        const option = new Option(analyst.nome, analyst.nome);
                        select.add(option);
                    });
                    
                    // Carregar projetos após carregar analistas
                    await this.loadProjects();
                    
                    // Renderizar calendário inicial
                    if (window.calendarManager) {
                        window.calendarManager.renderCalendar();
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao carregar analistas:', error);
        }
    }

    // Função para carregar projetos
    async loadProjects() {
        try {
            const response = await fetch('/api/projetos');
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    // Ordenar projetos em ordem alfabética
                    this.projects = result.data.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
                    
                    const select = document.getElementById('filtroProjeto');
                    
                    // Limpar opções existentes
                    select.innerHTML = '<option value="">Todos os Projetos</option>';
                    
                    this.projects.forEach(project => {
                        const option = new Option(project.nome, project.nome);
                        select.add(option);
                        
                        // Criar mapeamento projeto -> analistas
                        if (project.analistas && Array.isArray(project.analistas)) {
                            this.projectAnalystMapping[project.nome] = [...project.analistas];
                            
                            // Atualizar mapeamento analista -> projetos
                            project.analistas.forEach(analystName => {
                                if (this.analystProjectMapping[analystName]) {
                                    if (!this.analystProjectMapping[analystName].includes(project.nome)) {
                                        this.analystProjectMapping[analystName].push(project.nome);
                                    }
                                } else {
                                    this.analystProjectMapping[analystName] = [project.nome];
                                }
                            });
                        }
                    });
                    
                    console.log('✅ Projetos carregados:', this.projects.length);
                    console.log('📊 Mapeamento projeto->analistas:', this.projectAnalystMapping);
                    console.log('📊 Mapeamento analista->projetos:', this.analystProjectMapping);
                }
            } else {
                console.error('Erro ao carregar projetos');
            }
        } catch (error) {
            console.error('Erro ao carregar projetos:', error);
        }
    }

    // Funções de filtro melhoradas com interdependência
    filterCalendar() {
        const filtroAnalista = document.getElementById('filtroAnalista').value;
        const filtroProjeto = document.getElementById('filtroProjeto').value;
        const filtroTipo = document.getElementById('filtroTipo').value;
        
        console.log('🔍 Aplicando filtros:', { filtroAnalista, filtroProjeto, filtroTipo });
        
        // Aplicar lógica de filtros interdependentes
        this.updateFilterOptions(filtroAnalista, filtroProjeto);
        
        // Resetar tarefas disponíveis para os filtros
        if (window.taskManager) {
            window.taskManager.availableTasks = [...window.taskManager.originalTasks];
        }
        
        // Aplicar filtros nas tarefas disponíveis
        if (filtroAnalista && window.taskManager) {
            window.taskManager.availableTasks = window.taskManager.availableTasks.filter(task => task.analista === filtroAnalista);
            console.log(`📊 Filtrado por analista "${filtroAnalista}": ${window.taskManager.availableTasks.length} tarefas`);
        }
        
        if (filtroProjeto && window.taskManager) {
            window.taskManager.availableTasks = window.taskManager.availableTasks.filter(task => task.projeto === filtroProjeto);
            console.log(`📊 Filtrado por projeto "${filtroProjeto}": ${window.taskManager.availableTasks.length} tarefas`);
        }
        
        if (filtroTipo && window.taskManager) {
            window.taskManager.availableTasks = window.taskManager.availableTasks.filter(task => task.tipo === filtroTipo);
            console.log(`📊 Filtrado por tipo "${filtroTipo}": ${window.taskManager.availableTasks.length} tarefas`);
        }
        
        // Limpar tarefas existentes e redistribuir
        if (window.taskManager) {
            window.taskManager.clearAllTasks();
            
            // Redistribuir tarefas filtradas
            window.taskManager.availableTasks.forEach(task => {
                if (task.analista && window.taskManager.analystCapacities[task.analista]) {
                    // Calcular duração da tarefa
                    const startDate = new Date(task.dataInicio);
                    const endDate = new Date(task.dataFim);
                    const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                    
                    // Criar um card para cada dia da tarefa
                    for (let i = 0; i < durationDays; i++) {
                        const taskDate = new Date(startDate);
                        taskDate.setDate(startDate.getDate() + i);
                        
                        // Criar tarefa para este dia específico
                        const dailyTask = {
                            ...task,
                            id: `${task.id}_day_${i}`,
                            dataInicio: taskDate.toISOString().split('T')[0],
                            dataFim: taskDate.toISOString().split('T')[0],
                            horasEstimadas: Math.ceil(task.horasEstimadas / durationDays),
                            diaSemana: taskDate.getDay()
                        };
                        
                        // Adicionar à capacidade do analista
                        window.taskManager.analystCapacities[task.analista].tasks.push(dailyTask);
                        window.taskManager.analystCapacities[task.analista].allocatedHours += dailyTask.horasEstimadas;
                        
                        // Contar horas por tipo
                        if (task.tipo === 'projeto') {
                            window.taskManager.analystCapacities[task.analista].projectHours += dailyTask.horasEstimadas;
                        } else if (task.tipo === 'sustentacao') {
                            window.taskManager.analystCapacities[task.analista].sustentacaoHours += dailyTask.horasEstimadas;
                        }
                    }
                }
            });
        }
        
        // Re-renderizar calendário
        if (window.calendarManager) {
            window.calendarManager.renderCalendar();
        }
        
        console.log('✅ Filtros aplicados com sucesso');
    }

    // Função para atualizar opções dos filtros de forma interdependente
    updateFilterOptions(selectedAnalyst, selectedProject) {
        const analystSelect = document.getElementById('filtroAnalista');
        const projectSelect = document.getElementById('filtroProjeto');
        
        // Salvar valores atuais
        const currentAnalyst = analystSelect.value;
        const currentProject = projectSelect.value;
        
        // Atualizar opções do filtro de projeto baseado no analista selecionado
        if (selectedAnalyst) {
            // Filtrar projetos que contêm o analista selecionado
            const availableProjects = this.analystProjectMapping[selectedAnalyst] || [];
            
            // Limpar e recriar opções do projeto
            projectSelect.innerHTML = '<option value="">Todos os Projetos</option>';
            availableProjects.forEach(projectName => {
                const option = new Option(projectName, projectName);
                projectSelect.add(option);
            });
            
            console.log(`📊 Projetos disponíveis para "${selectedAnalyst}":`, availableProjects);
        } else {
            // Se nenhum analista está selecionado, mostrar todos os projetos
            projectSelect.innerHTML = '<option value="">Todos os Projetos</option>';
            this.projects.forEach(project => {
                const option = new Option(project.nome, project.nome);
                projectSelect.add(option);
            });
        }
        
        // Atualizar opções do filtro de analista baseado no projeto selecionado
        if (selectedProject) {
            // Filtrar analistas que trabalham no projeto selecionado
            const availableAnalysts = this.projectAnalystMapping[selectedProject] || [];
            
            // Limpar e recriar opções do analista
            analystSelect.innerHTML = '<option value="">Todos os Analistas</option>';
            availableAnalysts.forEach(analystName => {
                const option = new Option(analystName, analystName);
                analystSelect.add(option);
            });
            
            console.log(`📊 Analistas disponíveis para "${selectedProject}":`, availableAnalysts);
        } else {
            // Se nenhum projeto está selecionado, mostrar todos os analistas
            analystSelect.innerHTML = '<option value="">Todos os Analistas</option>';
            this.analysts.forEach(analyst => {
                const option = new Option(analyst.nome, analyst.nome);
                analystSelect.add(option);
            });
        }
        
        // Restaurar valores se ainda são válidos
        if (currentAnalyst && analystSelect.querySelector(`option[value="${currentAnalyst}"]`)) {
            analystSelect.value = currentAnalyst;
        }
        if (currentProject && projectSelect.querySelector(`option[value="${currentProject}"]`)) {
            projectSelect.value = currentProject;
        }
    }

    // Setup event listeners para filtros
    setupEventListeners() {
        document.getElementById('filtroAnalista').addEventListener('change', () => this.filterCalendar());
        document.getElementById('filtroProjeto').addEventListener('change', () => this.filterCalendar());
        document.getElementById('filtroTipo').addEventListener('change', () => this.filterCalendar());
    }
}

// Exportar para uso global
window.FilterManager = FilterManager;
