/**
 * Planejamento Semanal - Arquivo Principal Refatorado
 * Versão modular e otimizada do planejamento-semanal.js
 */

// Variáveis globais
let currentPlanning = null;
let dashboardData = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

function initializePage() {
    // Definir data de início padrão (data atual)
    const today = new Date();
    
    // Se hoje for segunda-feira, usar hoje. Senão, usar a próxima segunda-feira
    const dayOfWeek = today.getDay(); // 0 = domingo, 1 = segunda, etc.
    let startDate;
    
    if (dayOfWeek === 1) { // Segunda-feira
        startDate = today;
    } else {
        // Calcular próxima segunda-feira
        const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
        startDate = new Date(today);
        startDate.setDate(today.getDate() + daysUntilMonday);
    }
    
    document.getElementById('dataInicio').value = startDate.toISOString().split('T')[0];
    
    // Inicializar módulos
    initializeModules();
    
    // Carregar dados iniciais
    loadDashboardData();
    loadInitialData();
}

function initializeModules() {
    // Inicializar todos os módulos
    window.calendarManager = new CalendarManager();
    window.taskManager = new TaskManager();
    window.filterManager = new FilterManager();
    window.dragDropManager = new DragDropManager();
    window.pmoDashboard = new PMODashboard();
    
    // Configurar data inicial do calendário
    const dataInicio = document.getElementById('dataInicio').value;
    if (dataInicio) {
        window.calendarManager.currentDate = new Date(dataInicio);
    }
    
    // Setup event listeners
    window.filterManager.setupEventListeners();
    
    // Atualizar título do calendário
    window.calendarManager.updateCalendarTitle();
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

async function loadInitialData() {
    try {
        // Carregar analistas e projetos
        await window.filterManager.loadAnalysts();
        
        // Inicializar capacidades dos analistas
        if (window.filterManager.analysts.length > 0) {
            window.taskManager.initializeAnalystCapacities(window.filterManager.analysts);
        }
        
        // Renderizar calendário inicial
        window.calendarManager.renderCalendar();
        
        // Atualizar estatísticas PMO
        window.pmoDashboard.updatePMOStatistics();
        
    } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
    }
}

// Funções globais para compatibilidade com HTML
function voltarParaDashboard() {
    window.location.href = '/';
}

function loadPlanning() {
    if (window.taskManager) {
        window.taskManager.loadPlanning();
    }
}

function loadTasksFromProjects() {
    if (window.taskManager) {
        window.taskManager.loadTasksFromProjects();
    }
}

function distributeTasksByAnalyst() {
    if (window.taskManager) {
        window.taskManager.distributeTasksByAnalyst();
    }
}

function saveAllChanges() {
    if (window.taskManager) {
        window.taskManager.saveAllChanges();
    }
}

function setView(view) {
    if (window.calendarManager) {
        window.calendarManager.setView(view);
    }
}

function previousPeriod() {
    if (window.calendarManager) {
        window.calendarManager.previousPeriod();
    }
}

function nextPeriod() {
    if (window.calendarManager) {
        window.calendarManager.nextPeriod();
    }
}

function togglePMOView() {
    if (window.pmoDashboard) {
        window.pmoDashboard.togglePMOView();
    }
}

// Funções de filtro
function filterCalendar() {
    if (window.filterManager) {
        window.filterManager.filterCalendar();
    }
}

// Exportar funções para uso global
window.voltarParaDashboard = voltarParaDashboard;
window.loadPlanning = loadPlanning;
window.loadTasksFromProjects = loadTasksFromProjects;
window.distributeTasksByAnalyst = distributeTasksByAnalyst;
window.saveAllChanges = saveAllChanges;
window.setView = setView;
window.previousPeriod = previousPeriod;
window.nextPeriod = nextPeriod;
window.togglePMOView = togglePMOView;
window.filterCalendar = filterCalendar;
