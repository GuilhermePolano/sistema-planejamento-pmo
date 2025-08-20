/**
 * PMO Dashboard - Módulo para o painel PMO
 * Extraído do planejamento-semanal.js para melhor organização
 */

class PMODashboard {
    constructor() {
        this.pmoViewExpanded = false;
    }

    // Toggle da visão PMO
    togglePMOView() {
        this.pmoViewExpanded = !this.pmoViewExpanded;
        const toggleText = document.getElementById('pmoToggleText');
        const analystsList = document.getElementById('pmoAnalystsList');
        
        if (this.pmoViewExpanded) {
            toggleText.textContent = 'Ocultar Detalhes';
            analystsList.style.display = 'grid';
            this.updatePMOAnalystsList();
        } else {
            toggleText.textContent = 'Mostrar Detalhes';
            analystsList.style.display = 'none';
        }
    }

    // Atualizar estatísticas PMO
    updatePMOStatistics() {
        if (!window.calendarManager || !window.taskManager) return;

        const weekStart = window.calendarManager.getWeekStart(window.calendarManager.currentDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        // Calcular estatísticas da semana atual
        let totalAnalistasSemana = 0;
        let totalTarefasSemana = 0;
        let totalHorasSemana = 0;
        let totalAlocacao = 0;
        
        Object.keys(window.taskManager.analystCapacities).forEach(analystName => {
            const capacity = window.taskManager.analystCapacities[analystName];
            if (capacity.tasks && capacity.tasks.length > 0) {
                // Verificar se há tarefas na semana atual
                const tarefasSemana = capacity.tasks.filter(task => {
                    const taskDate = new Date(task.dataInicio);
                    return taskDate >= weekStart && taskDate <= weekEnd;
                });
                
                if (tarefasSemana.length > 0) {
                    totalAnalistasSemana++;
                    totalTarefasSemana += tarefasSemana.length;
                    
                    const horasSemana = tarefasSemana.reduce((sum, task) => sum + (task.horasEstimadas || 0), 0);
                    totalHorasSemana += horasSemana;
                    totalAlocacao += (horasSemana / capacity.weeklyCapacity) * 100;
                }
            }
        });
        
        const mediaAlocacao = totalAnalistasSemana > 0 ? Math.round(totalAlocacao / totalAnalistasSemana) : 0;
        
        // Atualizar estatísticas
        const totalAnalistasElement = document.getElementById('totalAnalistasSemana');
        const totalTarefasElement = document.getElementById('totalTarefasSemana');
        const totalHorasElement = document.getElementById('totalHorasSemana');
        const mediaAlocacaoElement = document.getElementById('mediaAlocacaoSemana');
        
        if (totalAnalistasElement) totalAnalistasElement.textContent = totalAnalistasSemana;
        if (totalTarefasElement) totalTarefasElement.textContent = totalTarefasSemana;
        if (totalHorasElement) totalHorasElement.textContent = `${totalHorasSemana}h`;
        if (mediaAlocacaoElement) mediaAlocacaoElement.textContent = `${mediaAlocacao}%`;
    }

    // Atualizar lista de analistas do PMO
    updatePMOAnalystsList() {
        if (!window.calendarManager || !window.taskManager) return;

        const weekStart = window.calendarManager.getWeekStart(window.calendarManager.currentDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const container = document.getElementById('pmoAnalystsList');
        if (!container) return;
        
        const html = Object.keys(window.taskManager.analystCapacities).map(analystName => {
            const capacity = window.taskManager.analystCapacities[analystName];
            
            // Filtrar tarefas da semana atual
            const tarefasSemana = capacity.tasks ? capacity.tasks.filter(task => {
                const taskDate = new Date(task.dataInicio);
                return taskDate >= weekStart && taskDate <= weekEnd;
            }) : [];
            
            if (tarefasSemana.length === 0) return '';
            
            // Calcular métricas da semana
            const horasSemana = tarefasSemana.reduce((sum, task) => sum + (task.horasEstimadas || 0), 0);
            const percentage = (horasSemana / capacity.weeklyCapacity) * 100;
            
            let statusClass = 'ok';
            let statusText = 'OK';
            if (percentage > 100) {
                statusClass = 'overloaded';
                statusText = 'Sobrecarregado';
            } else if (percentage > 80) {
                statusClass = 'warning';
                statusText = 'Atenção';
            }
            
            // Calcular distribuição por tipo na semana
            const projectHours = tarefasSemana
                .filter(task => task.tipo === 'projeto')
                .reduce((sum, task) => sum + (task.horasEstimadas || 0), 0);
            
            const sustentacaoHours = tarefasSemana
                .filter(task => task.tipo === 'sustentacao')
                .reduce((sum, task) => sum + (task.horasEstimadas || 0), 0);
            
            return `
                <div class="analyst-detail-card">
                    <div class="analyst-detail-header">
                        <div class="analyst-detail-name">${analystName}</div>
                        <div class="analyst-detail-status ${statusClass}">${statusText}</div>
                    </div>
                    
                    <div class="analyst-detail-metrics">
                        <div class="metric-item">
                            <div class="metric-value">${horasSemana}h</div>
                            <div class="metric-label">Semana</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-value">${capacity.allocatedHours}h</div>
                            <div class="metric-label">Total</div>
                        </div>
                    </div>
                    
                    <div class="analyst-detail-breakdown">
                        <div class="breakdown-item">
                            <div class="breakdown-label projeto">Projetos</div>
                            <div class="breakdown-value">${projectHours}h</div>
                        </div>
                        <div class="breakdown-item">
                            <div class="breakdown-label sustentacao">Sustentação</div>
                            <div class="breakdown-value">${sustentacaoHours}h</div>
                        </div>
                    </div>
                    
                    <div class="analyst-detail-tasks">
                        ${tarefasSemana.length} tarefas na semana atual
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = html;
    }
}

// Exportar para uso global
window.PMODashboard = PMODashboard;
