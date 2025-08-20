/**
 * Drag & Drop Manager - Módulo para gerenciamento de drag & drop
 * Extraído do planejamento-semanal.js para melhor organização
 */

class DragDropManager {
    constructor() {
        this.dragulaInstances = [];
    }

    // Setup drag and drop
    setupDragAndDrop() {
        // Limpar instâncias anteriores
        this.dragulaInstances.forEach(instance => instance.destroy());
        this.dragulaInstances = [];
        
        // Configurar drag & drop para todos os containers de tarefas
        const containers = document.querySelectorAll('.tasks-container');
        const dragulaInstance = dragula(containers, {
            moves: function(el, container, handle) {
                return el.classList.contains('task-card');
            }
        });
        
        dragulaInstance.on('drop', (el, target, source, sibling) => {
            const taskId = el.dataset.taskId;
            const targetDay = target.dataset.day;
            
            // Atualizar data da tarefa
            if (window.taskManager) {
                window.taskManager.updateTaskDate(taskId, targetDay);
            }
        });
        
        this.dragulaInstances.push(dragulaInstance);
    }

    // Limpar instâncias de drag & drop
    destroyInstances() {
        this.dragulaInstances.forEach(instance => instance.destroy());
        this.dragulaInstances = [];
    }
}

// Exportar para uso global
window.DragDropManager = DragDropManager;
