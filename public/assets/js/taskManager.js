/**
 * Task Manager - Módulo para gerenciamento de tarefas
 * Extraído do planejamento-semanal.js para melhor organização
 */

class TaskManager {
    constructor() {
        this.availableTasks = [];
        this.originalTasks = []; // Backup das tarefas originais para filtros
        this.analystCapacities = {};
    }

    // Função para carregar tarefas dos projetos e sustentações
    async loadTasksFromProjects() {
        try {
            console.log('🔄 Carregando tarefas dos projetos...');
            const response = await fetch('/api/tarefas-planejamento');
            
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    this.availableTasks = result.data;
                    this.originalTasks = [...result.data]; // Backup para filtros
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
    distributeTasksByAnalyst() {
        if (this.availableTasks.length === 0) {
            alert('Nenhuma tarefa disponível. Carregue as tarefas dos projetos primeiro.');
            return;
        }
        
        // Limpar tarefas existentes
        this.clearAllTasks();
        
        // Distribuir tarefas por analista
        this.availableTasks.forEach(task => {
            if (task.analista && this.analystCapacities[task.analista]) {
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
                    this.analystCapacities[task.analista].tasks.push(dailyTask);
                    this.analystCapacities[task.analista].allocatedHours += dailyTask.horasEstimadas;
                    
                    // Contar horas por tipo
                    if (task.tipo === 'projeto') {
                        this.analystCapacities[task.analista].projectHours += dailyTask.horasEstimadas;
                    } else if (task.tipo === 'sustentacao') {
                        this.analystCapacities[task.analista].sustentacaoHours += dailyTask.horasEstimadas;
                    }
                }
            }
        });
        
        // Re-renderizar calendário
        if (window.calendarManager) {
            window.calendarManager.renderCalendar();
        }
        alert('Tarefas distribuídas por analista com sucesso!');
    }

    // Função para limpar todas as tarefas
    clearAllTasks() {
        Object.keys(this.analystCapacities).forEach(analystName => {
            this.analystCapacities[analystName].tasks = [];
            this.analystCapacities[analystName].allocatedHours = 0;
            this.analystCapacities[analystName].projectHours = 0;
            this.analystCapacities[analystName].sustentacaoHours = 0;
        });
    }

    // Função para atualizar data da tarefa (drag & drop)
    updateTaskDate(taskId, newDate) {
        // Encontrar e atualizar a tarefa
        Object.keys(this.analystCapacities).forEach(analystName => {
            const capacity = this.analystCapacities[analystName];
            if (capacity.tasks) {
                const taskIndex = capacity.tasks.findIndex(t => t.id === taskId);
                if (taskIndex !== -1) {
                    capacity.tasks[taskIndex].dataInicio = newDate;
                    capacity.tasks[taskIndex].dataFim = newDate;
                    
                    // Recalcular capacidades
                    this.updateAnalystCapacities();
                    if (window.calendarManager) {
                        window.calendarManager.renderCalendar();
                    }
                    return;
                }
            }
        });
    }

    // Função para atualizar capacidades dos analistas
    updateAnalystCapacities() {
        Object.keys(this.analystCapacities).forEach(analystName => {
            const capacity = this.analystCapacities[analystName];
            capacity.allocatedHours = 0;
            capacity.projectHours = 0;
            capacity.sustentacaoHours = 0;
            
            if (capacity.tasks) {
                capacity.tasks.forEach(task => {
                    capacity.allocatedHours += task.horasEstimadas || 0;
                    
                    // Contar horas por tipo
                    if (task.tipo === 'projeto') {
                        capacity.projectHours += task.horasEstimadas || 0;
                    } else if (task.tipo === 'sustentacao') {
                        capacity.sustentacaoHours += task.horasEstimadas || 0;
                    }
                });
            }
        });
    }

    // Função para carregar planejamento
    async loadPlanning() {
        const dataInicio = document.getElementById('dataInicio').value;
        
        if (!dataInicio) {
            alert('Por favor, selecione uma data de início.');
            return;
        }
        
        if (window.calendarManager) {
            window.calendarManager.currentDate = new Date(dataInicio);
            window.calendarManager.updateCalendarTitle();
            window.calendarManager.renderCalendar();
        }
    }

    // Função para salvar todas as mudanças
    async saveAllChanges() {
        try {
            // Aqui você pode implementar a lógica para salvar o planejamento
            const planningData = {
                date: window.calendarManager ? window.calendarManager.currentDate : new Date(),
                view: window.calendarManager ? window.calendarManager.currentView : 'week',
                analystCapacities: this.analystCapacities,
                tasks: this.availableTasks
            };
            
            console.log('💾 Salvando planejamento:', planningData);
            alert('Planejamento salvo com sucesso!');
            
        } catch (error) {
            console.error('Erro ao salvar planejamento:', error);
            alert('Erro ao salvar planejamento.');
        }
    }

    // Função para mostrar loading
    showLoading() {
        const container = document.getElementById('calendar-content');
        container.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner"></i>
                <p>Carregando planejamento...</p>
            </div>
        `;
    }

    // Função para mostrar estado vazio
    showEmptyState() {
        const container = document.getElementById('calendar-content');
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <h3>Nenhum planejamento encontrado</h3>
                <p>Clique em "Carregar Planejamento" para começar.</p>
            </div>
        `;
    }

    // Inicializar capacidades dos analistas
    initializeAnalystCapacities(analysts) {
        analysts.forEach(analyst => {
            this.analystCapacities[analyst.nome] = {
                weeklyCapacity: 40,
                allocatedHours: 0,
                tasks: [],
                projectHours: 0,
                sustentacaoHours: 0
            };
        });
    }
}

// Exportar para uso global
window.TaskManager = TaskManager;
