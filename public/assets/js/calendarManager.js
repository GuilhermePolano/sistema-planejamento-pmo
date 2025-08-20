/**
 * Calendar Manager - Módulo para gerenciamento do calendário
 * Extraído do planejamento-semanal.js para melhor organização
 */

class CalendarManager {
    constructor() {
        this.currentDate = new Date();
        this.currentView = 'week'; // 'week' ou 'month'
    }

    // Funções de navegação do calendário
    setView(view) {
        this.currentView = view;
        
        // Atualizar botões de toggle
        document.querySelectorAll('.view-toggle button').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        this.renderCalendar();
    }

    previousPeriod() {
        if (this.currentView === 'week') {
            this.currentDate.setDate(this.currentDate.getDate() - 7);
        } else {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        }
        this.updateCalendarTitle();
        this.renderCalendar();
    }

    nextPeriod() {
        if (this.currentView === 'week') {
            this.currentDate.setDate(this.currentDate.getDate() + 7);
        } else {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        }
        this.updateCalendarTitle();
        this.renderCalendar();
    }

    updateCalendarTitle() {
        const title = document.getElementById('currentMonthTitle');
        if (this.currentView === 'week') {
            const weekStart = this.getWeekStart(this.currentDate);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            
            title.textContent = `${weekStart.toLocaleDateString('pt-BR')} - ${weekEnd.toLocaleDateString('pt-BR')}`;
        } else {
            title.textContent = this.currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        }
    }

    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay(); // 0 = domingo, 1 = segunda, 2 = terça, etc.
        
        // Calcular quantos dias voltar para chegar na segunda-feira
        // Se for segunda (1), não voltar nenhum dia
        // Se for terça (2), voltar 1 dia
        // Se for domingo (0), voltar 6 dias
        const daysToSubtract = day === 0 ? 6 : day - 1;
        
        d.setDate(d.getDate() - daysToSubtract);
        return d;
    }

    // Função principal para renderizar o calendário
    renderCalendar() {
        const container = document.getElementById('calendar-content');
        
        if (this.currentView === 'week') {
            this.renderWeekView(container);
        } else {
            this.renderMonthView(container);
        }
        
        // Setup drag and drop
        if (window.dragDropManager) {
            window.dragDropManager.setupDragAndDrop();
        }
        
        // Atualizar capacidades dos analistas
        if (window.taskManager) {
            window.taskManager.updateAnalystCapacities();
        }
        
        // Atualizar estatísticas PMO
        if (window.pmoDashboard) {
            window.pmoDashboard.updatePMOStatistics();
        }
    }

    renderWeekView(container) {
        const weekStart = this.getWeekStart(this.currentDate);
        const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const filtroAnalista = document.getElementById('filtroAnalista').value;
        
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
        
        // Coluna dos analistas - FILTRADA
        html += '<div class="analyst-column">';
        
        // Determinar quais analistas mostrar
        let analystsToShow = window.analysts || [];
        if (filtroAnalista) {
            analystsToShow = analystsToShow.filter(analyst => analyst.nome === filtroAnalista);
        }
        
        analystsToShow.forEach(analyst => {
            const capacity = window.analystCapacities[analyst.nome] || { 
                weeklyCapacity: 40, 
                allocatedHours: 0, 
                projectHours: 0, 
                sustentacaoHours: 0 
            };
            const percentage = (capacity.allocatedHours / capacity.weeklyCapacity) * 100;
            
            let statusClass = 'ok';
            if (percentage > 100) statusClass = 'overloaded';
            else if (percentage > 80) statusClass = 'warning';
            
            // Calcular porcentagens de projetos vs sustentação
            const totalHours = capacity.allocatedHours || 1; // Evitar divisão por zero
            const projectPercentage = Math.round((capacity.projectHours / totalHours) * 100);
            const sustentacaoPercentage = Math.round((capacity.sustentacaoHours / totalHours) * 100);
            
            // Calcular horas restantes na semana
            const remainingHours = Math.max(0, capacity.weeklyCapacity - capacity.allocatedHours);
            
            html += `
                <div class="analyst-header">${analyst.nome}</div>
                <div class="analyst-capacity">
                    <div class="capacity-summary">
                        <div class="capacity-hours">${capacity.allocatedHours}h / ${capacity.weeklyCapacity}h</div>
                        <div class="capacity-percentage">${Math.round(percentage)}% alocado</div>
                    </div>
                    <div class="capacity-bar">
                        <div class="capacity-fill ${statusClass}" style="width: ${Math.min(percentage, 100)}%"></div>
                    </div>
                    <div class="capacity-details">
                        <div class="remaining-hours">${remainingHours}h disponíveis</div>
                    </div>
                    
                    <!-- NOVA SEÇÃO: Distribuição por tipo -->
                    <div class="analyst-distribution">
                        <div class="distribution-item">
                            <span class="distribution-label projeto">Projetos:</span>
                            <span class="distribution-value">${projectPercentage}% (${capacity.projectHours}h)</span>
                        </div>
                        <div class="distribution-item">
                            <span class="distribution-label sustentacao">Sustentação:</span>
                            <span class="distribution-value">${sustentacaoPercentage}% (${capacity.sustentacaoHours}h)</span>
                        </div>
                    </div>
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
            
            // Adicionar tarefas para este dia - FILTRADAS
            analystsToShow.forEach(analyst => {
                const capacity = window.analystCapacities[analyst.nome];
                if (capacity && capacity.tasks) {
                    capacity.tasks.forEach(task => {
                        if (task.dataInicio === dayKey) {
                            html += this.createTaskCardHTML(task);
                        }
                    });
                }
            });
            
            html += '</div></div>';
        }
        
        html += '</div>';
        container.innerHTML = html;
    }

    renderMonthView(container) {
        // Implementação da visão mensal (pode ser expandida posteriormente)
        container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar"></i><h3>Visão Mensal</h3><p>Funcionalidade em desenvolvimento</p></div>';
    }

    createTaskCardHTML(task) {
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
}

// Exportar para uso global
window.CalendarManager = CalendarManager;
