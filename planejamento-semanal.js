// Variáveis globais
let currentPlanning = null;
let currentDate = new Date();
let currentView = 'week'; // 'week' ou 'month'
let dragulaInstances = [];
let availableTasks = [];
let analystCapacities = {};
let dashboardData = null;
let analysts = [];
let originalTasks = []; // Backup das tarefas originais para filtros

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
});

function initializePage() {
    // Definir data de início padrão (próxima segunda-feira)
    const today = new Date();
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + (8 - today.getDay()) % 7);
    
    document.getElementById('dataInicio').value = nextMonday.toISOString().split('T')[0];
    currentDate = nextMonday;
    
    // Carregar dados iniciais
    loadDashboardData();
    loadAnalysts();
    updateCalendarTitle();
}

function setupEventListeners() {
    // Event listeners para filtros
    document.getElementById('filtroAnalista').addEventListener('change', filterCalendar);
    document.getElementById('filtroTipo').addEventListener('change', filterCalendar);
}

// Funções de carregamento de dados
async function loadDashboardData() {
    try {
        const response = await fetch('/data/dashboard-data.json');
        if (response.ok) {
            dashboardData = await response.json();
            console.log('✅ Dados do dashboard carregados');
        } else {
            console.error('Erro ao carregar dados do dashboard');
            dashboardData = null;
        }
    } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        dashboardData = null;
    }
}

async function loadAnalysts() {
    try {
        const response = await fetch('/api/analistas');
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                // Ordenar analistas em ordem alfabética
                analysts = result.data.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
                
                const select = document.getElementById('filtroAnalista');
                
                // Limpar opções existentes
                select.innerHTML = '<option value="">Todos os Analistas</option>';
                
                analysts.forEach(analyst => {
                    const option = new Option(analyst.nome, analyst.nome);
                    select.add(option);
                    
                    // Inicializar capacidade padrão para o analista
                    analystCapacities[analyst.nome] = {
                        weeklyCapacity: 40,
                        allocatedHours: 0,
                        tasks: []
                    };
                });
                
                // Renderizar calendário inicial
                renderCalendar();
            }
        }
    } catch (error) {
        console.error('Erro ao carregar analistas:', error);
    }
}

// Função para carregar tarefas dos projetos e sustentações
async function loadTasksFromProjects() {
    try {
        console.log('🔄 Carregando tarefas dos projetos...');
        const response = await fetch('/api/tarefas-planejamento');
        
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                availableTasks = result.data;
                originalTasks = [...result.data]; // Backup para filtros
                console.log(`✅ Carregadas ${result.data.length} tarefas dos projetos e sustentações`);
                
                alert(`Carregadas ${result.data.length} tarefas dos projetos e sustentações!`);
            } else {
                throw new Error(result.message || 'Erro ao carregar tarefas');
            }
        } else {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Erro ao carregar tarefas dos projetos:', error);
        alert('Erro ao carregar tarefas dos projetos: ' + error.message);
    }
}

// Função para distribuir tarefas por analista
function distributeTasksByAnalyst() {
    if (availableTasks.length === 0) {
        alert('Nenhuma tarefa disponível. Carregue as tarefas dos projetos primeiro.');
        return;
    }
    
    // Limpar tarefas existentes
    clearAllTasks();
    
    // Distribuir tarefas por analista
    availableTasks.forEach(task => {
        if (task.analista && analystCapacities[task.analista]) {
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
                analystCapacities[task.analista].tasks.push(dailyTask);
                analystCapacities[task.analista].allocatedHours += dailyTask.horasEstimadas;
            }
        }
    });
    
    // Re-renderizar calendário
    renderCalendar();
    alert('Tarefas distribuídas por analista com sucesso!');
}

// Função para limpar todas as tarefas
function clearAllTasks() {
    Object.keys(analystCapacities).forEach(analystName => {
        analystCapacities[analystName].tasks = [];
        analystCapacities[analystName].allocatedHours = 0;
    });
}

// Funções de navegação do calendário
function setView(view) {
    currentView = view;
    
    // Atualizar botões de toggle
    document.querySelectorAll('.view-toggle button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderCalendar();
}

function previousPeriod() {
    if (currentView === 'week') {
        currentDate.setDate(currentDate.getDate() - 7);
    } else {
        currentDate.setMonth(currentDate.getMonth() - 1);
    }
    updateCalendarTitle();
    renderCalendar();
}

function nextPeriod() {
    if (currentView === 'week') {
        currentDate.setDate(currentDate.getDate() + 7);
    } else {
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    updateCalendarTitle();
    renderCalendar();
}

function updateCalendarTitle() {
    const title = document.getElementById('currentMonthTitle');
    if (currentView === 'week') {
        const weekStart = getWeekStart(currentDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        title.textContent = `${weekStart.toLocaleDateString('pt-BR')} - ${weekEnd.toLocaleDateString('pt-BR')}`;
    } else {
        title.textContent = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }
}

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar quando domingo
    return new Date(d.setDate(diff));
}

// Função principal para renderizar o calendário
function renderCalendar() {
    const container = document.getElementById('calendar-content');
    
    if (currentView === 'week') {
        renderWeekView(container);
    } else {
        renderMonthView(container);
    }
    
    setupDragAndDrop();
    updateAnalystCapacities();
}

function renderWeekView(container) {
    const weekStart = getWeekStart(currentDate);
    const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    let html = `
        <div class="calendar-header">
            <div>Analistas</div>
    `;
    
    // Cabeçalho dos dias
    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + i);
        
        html += `
            <div>
                <div>${daysOfWeek[i]}</div>
                <div class="day-date">${dayDate.toLocaleDateString('pt-BR')}</div>
            </div>
        `;
    }
    
    html += '</div><div class="calendar-grid">';
    
    // Coluna dos analistas
    html += '<div class="analyst-column">';
    analysts.forEach(analyst => {
        const capacity = analystCapacities[analyst.nome] || { weeklyCapacity: 40, allocatedHours: 0 };
        const percentage = (capacity.allocatedHours / capacity.weeklyCapacity) * 100;
        
        let statusClass = 'ok';
        if (percentage > 100) statusClass = 'overloaded';
        else if (percentage > 80) statusClass = 'warning';
        
        html += `
            <div class="analyst-header">${analyst.nome}</div>
            <div class="analyst-capacity">
                <div>${capacity.allocatedHours}h / ${capacity.weeklyCapacity}h</div>
                <div class="capacity-bar">
                    <div class="capacity-fill ${statusClass}" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
                <div>${Math.round(percentage)}%</div>
            </div>
        `;
    });
    html += '</div>';
    
    // Colunas dos dias
    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + i);
        const dayKey = dayDate.toISOString().split('T')[0];
        
        html += `
            <div class="day-column">
                <div class="day-header">
                    ${daysOfWeek[i]}
                    <div class="day-date">${dayDate.toLocaleDateString('pt-BR')}</div>
                </div>
                <div class="tasks-container" data-day="${dayKey}">
        `;
        
        // Adicionar tarefas para este dia
        analysts.forEach(analyst => {
            const capacity = analystCapacities[analyst.nome];
            if (capacity && capacity.tasks) {
                capacity.tasks.forEach(task => {
                    if (task.dataInicio === dayKey) {
                        html += createTaskCardHTML(task);
                    }
                });
            }
        });
        
        html += '</div></div>';
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function renderMonthView(container) {
    // Implementação da visão mensal (pode ser expandida posteriormente)
    container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar"></i><h3>Visão Mensal</h3><p>Funcionalidade em desenvolvimento</p></div>';
}

function createTaskCardHTML(task) {
    const typeClass = task.tipo === 'projeto' ? 'task-type-projeto' : 'task-type-sustentacao';
    
    return `
        <div class="task-card" data-task-id="${task.id}" draggable="true">
            <div class="task-title">${task.titulo}</div>
            <div class="task-meta">
                <span class="${typeClass}">${task.tipo}</span>
                <span>${task.status}</span>
            </div>
            <div class="task-hours">${task.horasEstimadas}h</div>
            <div class="task-project">${task.projeto}</div>
        </div>
    `;
}

function setupDragAndDrop() {
    // Limpar instâncias anteriores
    dragulaInstances.forEach(instance => instance.destroy());
    dragulaInstances = [];
    
    // Configurar drag & drop para todos os containers de tarefas
    const containers = document.querySelectorAll('.tasks-container');
    const dragulaInstance = dragula(containers, {
        moves: function(el, container, handle) {
            return el.classList.contains('task-card');
        }
    });
    
    dragulaInstance.on('drop', function(el, target, source, sibling) {
        const taskId = el.dataset.taskId;
        const targetDay = target.dataset.day;
        
        // Atualizar data da tarefa
        updateTaskDate(taskId, targetDay);
    });
    
    dragulaInstances.push(dragulaInstance);
}

function updateTaskDate(taskId, newDate) {
    // Encontrar e atualizar a tarefa
    Object.keys(analystCapacities).forEach(analystName => {
        const capacity = analystCapacities[analystName];
        if (capacity.tasks) {
            const taskIndex = capacity.tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                capacity.tasks[taskIndex].dataInicio = newDate;
                capacity.tasks[taskIndex].dataFim = newDate;
                
                // Recalcular capacidades
                updateAnalystCapacities();
                renderCalendar();
                return;
            }
        }
    });
}

function updateAnalystCapacities() {
    Object.keys(analystCapacities).forEach(analystName => {
        const capacity = analystCapacities[analystName];
        capacity.allocatedHours = 0;
        
        if (capacity.tasks) {
            capacity.tasks.forEach(task => {
                capacity.allocatedHours += task.horasEstimadas || 0;
            });
        }
    });
}

// Funções de filtro melhoradas
function filterCalendar() {
    const filtroAnalista = document.getElementById('filtroAnalista').value;
    const filtroTipo = document.getElementById('filtroTipo').value;
    
    console.log('🔍 Aplicando filtros:', { filtroAnalista, filtroTipo });
    
    // Resetar tarefas disponíveis para os filtros
    availableTasks = [...originalTasks];
    
    // Aplicar filtros nas tarefas disponíveis
    if (filtroAnalista) {
        availableTasks = availableTasks.filter(task => task.analista === filtroAnalista);
        console.log(`📊 Filtrado por analista "${filtroAnalista}": ${availableTasks.length} tarefas`);
    }
    
    if (filtroTipo) {
        availableTasks = availableTasks.filter(task => task.tipo === filtroTipo);
        console.log(`📊 Filtrado por tipo "${filtroTipo}": ${availableTasks.length} tarefas`);
    }
    
    // Limpar tarefas existentes e redistribuir
    clearAllTasks();
    
    // Redistribuir tarefas filtradas
    availableTasks.forEach(task => {
        if (task.analista && analystCapacities[task.analista]) {
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
                analystCapacities[task.analista].tasks.push(dailyTask);
                analystCapacities[task.analista].allocatedHours += dailyTask.horasEstimadas;
            }
        }
    });
    
    // Re-renderizar calendário
    renderCalendar();
    
    console.log('✅ Filtros aplicados com sucesso');
}

// Funções de planejamento
async function loadPlanning() {
    const dataInicio = document.getElementById('dataInicio').value;
    const numSemanas = parseInt(document.getElementById('numSemanas').value);
    
    if (!dataInicio) {
        alert('Por favor, selecione uma data de início.');
        return;
    }
    
    currentDate = new Date(dataInicio);
    updateCalendarTitle();
    renderCalendar();
}

// Funções de salvamento
async function saveAllChanges() {
    try {
        // Aqui você pode implementar a lógica para salvar o planejamento
        const planningData = {
            date: currentDate,
            view: currentView,
            analystCapacities: analystCapacities,
            tasks: availableTasks
        };
        
        console.log('💾 Salvando planejamento:', planningData);
        alert('Planejamento salvo com sucesso!');
        
    } catch (error) {
        console.error('Erro ao salvar planejamento:', error);
        alert('Erro ao salvar planejamento.');
    }
}

// Funções utilitárias
function showLoading() {
    const container = document.getElementById('calendar-content');
    container.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner"></i>
            <p>Carregando planejamento...</p>
        </div>
    `;
}

function showEmptyState() {
    const container = document.getElementById('calendar-content');
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-calendar-times"></i>
            <h3>Nenhum planejamento encontrado</h3>
            <p>Clique em "Carregar Planejamento" para começar.</p>
        </div>
    `;
}
