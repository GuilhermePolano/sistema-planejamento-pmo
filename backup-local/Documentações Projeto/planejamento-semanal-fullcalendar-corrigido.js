// ========================================
// PLANNER SEMANAL - FULLCALENDAR.JS CORRIGIDO
// ========================================

// Variáveis globais
let calendar;
let dadosTarefas = [];
let dadosAnalistas = [];
let dadosProjetos = [];
let filtrosAtivos = {
    analista: '',
    projeto: '',
    tipo: '',
    dataInicial: ''
};

// NOVA VARIÁVEL: Controle de dias úteis
let mostrarApenasDiasUteis = false;

// ========================================
// INICIALIZAÇÃO
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando Planner Semanal com FullCalendar Corrigido...');
    
    // Inicializar calendário
    inicializarCalendario();
    
    // Carregar dados
    carregarDados();
    
    // Configurar filtros
    configurarFiltros();
    
    // NOVO: Configurar controles de dias úteis
    configurarControlesDiasUteis();
    
    // Configurar data inicial
    configurarDataInicial();
});

// ========================================
// INICIALIZAÇÃO DO FULLCALENDAR CORRIGIDO
// ========================================

function inicializarCalendario() {
    const calendarEl = document.getElementById('calendar');
    
    calendar = new FullCalendar.Calendar(calendarEl, {
        // CORREÇÃO: Configuração básica corrigida
        initialView: 'timeGridWeek',
        locale: 'pt-br',
        timeZone: 'America/Sao_Paulo',
        firstDay: 1, // Segunda-feira como primeiro dia da semana
        
        // NOVA CONFIGURAÇÃO: Controle dinâmico de finais de semana
        weekends: true, // Inicialmente mostra todos os dias
        hiddenDays: [], // Inicialmente não oculta nenhum dia
        
        // Cabeçalho e navegação
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        
        // Configurações de visualização
        height: 'auto',
        aspectRatio: 1.8,
        expandRows: true,
        dayMaxEvents: true,
        
        // Configurações de interação
        editable: true,
        droppable: true,
        selectable: true,
        selectMirror: true,
        
        // Horário de trabalho
        slotMinTime: '08:00:00',
        slotMaxTime: '18:00:00',
        allDaySlot: false,
        
        // Configurações de eventos
        eventDisplay: 'block',
        eventTimeFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        },
        
        // Cores e estilos
        eventColor: '#667eea',
        eventTextColor: '#ffffff',
        
        // Callbacks de eventos
        events: function(info, successCallback, failureCallback) {
            carregarEventosCalendario(info.start, info.end, successCallback);
        },
        
        // Seleção de datas
        select: function(info) {
            console.log('📅 Data selecionada:', info.startStr);
            console.log('📅 Dia da semana:', new Date(info.startStr).getDay());
        },
        
        // Drag & Drop de eventos
        eventDrop: function(info) {
            console.log('🔄 Evento movido:', info.event.title);
            salvarPosicaoEvento(info.event);
        },
        
        // Clique em evento
        eventClick: function(info) {
            console.log('👆 Evento clicado:', info.event.title);
            mostrarDetalhesEvento(info.event);
        },
        
        // Redimensionamento de eventos
        eventResize: function(info) {
            console.log('📏 Evento redimensionado:', info.event.title);
            salvarDuracaoEvento(info.event);
        },
        
        // Carregamento de eventos
        loading: function(isLoading) {
            if (isLoading) {
                console.log('⏳ Carregando eventos...');
            } else {
                console.log('✅ Eventos carregados!');
            }
        }
    });
    
    calendar.render();
    console.log('✅ Calendário FullCalendar corrigido inicializado!');
}

// ========================================
// NOVA FUNÇÃO: Controle de Dias Úteis
// ========================================

function configurarControlesDiasUteis() {
    // Configurar event listener para o botão toggle
    const botaoToggle = document.getElementById('toggle-dias-uteis');
    if (botaoToggle) {
        botaoToggle.addEventListener('change', alternarDiasUteis);
        console.log('✅ Controle de dias úteis configurado');
    } else {
        console.warn('⚠️ Botão toggle-dias-uteis não encontrado');
    }
}

// Função para alternar entre modos de visualização
function alternarDiasUteis() {
    mostrarApenasDiasUteis = !mostrarApenasDiasUteis;
    
    console.log('🔄 Alternando modo dias úteis:', mostrarApenasDiasUteis);
    
    if (mostrarApenasDiasUteis) {
        // Modo: Apenas dias úteis (Segunda a Sexta)
        calendar.setOption('hiddenDays', [0, 6]); // Ocultar domingo (0) e sábado (6)
        calendar.setOption('weekends', false);
        console.log('✅ Finais de semana ocultados');
    } else {
        // Modo: Todos os dias (Domingo a Sábado)
        calendar.setOption('hiddenDays', []);
        calendar.setOption('weekends', true);
        console.log('✅ Todos os dias visíveis');
    }
    
    // Recarregar calendário
    calendar.render();
    
    // Atualizar estado visual do botão
    atualizarEstadoBotaoDiasUteis();
}

// Função para atualizar estado visual do botão
function atualizarEstadoBotaoDiasUteis() {
    const botao = document.getElementById('toggle-dias-uteis');
    const label = document.querySelector('label[for="toggle-dias-uteis"]');
    
    if (!label) return;
    
    if (mostrarApenasDiasUteis) {
        label.innerHTML = `
            <i class="fas fa-calendar-check me-1"></i>
            <strong>Somente Dias Úteis</strong>
            <span class="badge bg-success ms-2">Ativo</span>
        `;
    } else {
        label.innerHTML = `
            <i class="fas fa-calendar me-1"></i>
            <strong>Todos os Dias</strong>
            <span class="badge bg-secondary ms-2">Inativo</span>
        `;
    }
}

// ========================================
// FUNÇÃO CORRIGIDA: Cálculo de Data Inicial
// ========================================

function configurarDataInicial() {
    // CORREÇÃO: Calcular segunda-feira da semana atual corretamente
    const hoje = new Date();
    const diaSemana = hoje.getDay(); // 0=Domingo, 1=Segunda, ..., 6=Sábado
    
    // Calcular dias até segunda-feira
    const diasParaSegunda = diaSemana === 0 ? 1 : (diaSemana === 1 ? 0 : 8 - diaSemana);
    
    const segunda = new Date(hoje);
    segunda.setDate(hoje.getDate() + diasParaSegunda);
    
    const dataFormatada = segunda.toISOString().split('T')[0];
    document.getElementById('data-inicial').value = dataFormatada;
    filtrosAtivos.dataInicial = dataFormatada;
    
    console.log('📅 Data inicial configurada:', dataFormatada);
    console.log('📅 Dia da semana:', segunda.toLocaleDateString('pt-BR', { weekday: 'long' }));
}

// ========================================
// FUNÇÃO CORRIGIDA: Cálculo de Início da Semana
// ========================================

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0=Domingo, 1=Segunda, ..., 6=Sábado
    
    // CORREÇÃO: Calcular segunda-feira corretamente
    const diasParaSegunda = day === 0 ? 1 : (day === 1 ? 0 : 8 - day);
    
    const segunda = new Date(d);
    segunda.setDate(d.getDate() + diasParaSegunda);
    
    return segunda;
}

// ========================================
// CARREGAMENTO DE DADOS
// ========================================

async function carregarDados() {
    try {
        console.log('📊 Carregando dados do sistema...');
        
        // Carregar dados do dashboard
        const response = await fetch('/api/dashboard-data');
        const dados = await response.json();
        
        // Processar dados
        dadosTarefas = dados.tarefas || [];
        dadosAnalistas = dados.analistas || [];
        dadosProjetos = dados.projetos || [];
        
        // Atualizar estatísticas
        atualizarEstatisticas(dados);
        
        // Preencher filtros
        preencherFiltros();
        
        // Recarregar calendário
        calendar.refetchEvents();
        
        console.log('✅ Dados carregados com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        mostrarErro('Erro ao carregar dados do sistema');
    }
}



// ========================================
// CARREGAMENTO DE EVENTOS
// ========================================

async function carregarEventosCalendario(dataInicio, dataFim, callback) {
    try {
        console.log('📅 Carregando eventos para:', dataInicio, 'até', dataFim);
        
        // Aplicar filtros
        const filtros = {
            dataInicial: dataInicio.toISOString(),
            dataFinal: dataFim.toISOString(),
            ...filtrosAtivos
        };
        
        // Buscar tarefas
        const response = await fetch('/api/tarefas-planejamento?' + new URLSearchParams(filtros));
        const tarefas = await response.json();
        
        // Converter tarefas para eventos do FullCalendar
        const eventos = tarefas.map(tarefa => ({
            id: tarefa.id,
            title: tarefa.titulo,
            start: tarefa.dataInicio,
            end: tarefa.dataFim,
            allDay: false,
            backgroundColor: getCorTarefa(tarefa.tipo),
            borderColor: getCorTarefa(tarefa.tipo),
            textColor: '#ffffff',
            extendedProps: {
                analista: tarefa.analista,
                projeto: tarefa.projeto,
                tipo: tarefa.tipo,
                descricao: tarefa.descricao,
                horas: tarefa.horas
            }
        }));
        
        // Buscar configurações de capacidade
        const responseCapacidade = await fetch('/api/analistas-capacidade');
        const capacidades = await responseCapacidade.json();
        
        // Adicionar eventos de capacidade
        const eventosCapacidade = capacidades.map(cap => ({
            id: `cap_${cap.analista}_${cap.data}`,
            title: `${cap.analista} - ${cap.capacidade}%`,
            start: cap.data,
            end: cap.data,
            allDay: true,
            backgroundColor: getCorCapacidade(cap.capacidade),
            borderColor: getCorCapacidade(cap.capacidade),
            textColor: '#ffffff',
            extendedProps: {
                tipo: 'capacidade',
                analista: cap.analista,
                capacidade: cap.capacidade
            }
        }));
        
        // Combinar eventos
        const todosEventos = [...eventos, ...eventosCapacidade];
        
        callback(todosEventos);
        
    } catch (error) {
        console.error('❌ Erro ao carregar eventos:', error);
        callback([]);
    }
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

function getCorTarefa(tipo) {
    const cores = {
        'projeto': '#28a745',
        'sustentacao': '#ffc107',
        'interno': '#17a2b8'
    };
    return cores[tipo] || '#667eea';
}

function getCorCapacidade(capacidade) {
    if (capacidade === 0) return '#dc3545';
    if (capacidade < 50) return '#fd7e14';
    if (capacidade < 100) return '#ffc107';
    return '#28a745';
}

function atualizarEstatisticas(dados) {
    document.getElementById('total-tarefas').textContent = dados.tarefas?.length || 0;
    document.getElementById('analistas-ativos').textContent = dados.analistas?.length || 0;
    document.getElementById('projetos-ativos').textContent = dados.projetos?.length || 0;
    
    // Calcular capacidade total
    const capacidadeTotal = dados.analistas?.reduce((total, analista) => {
        return total + (analista.capacidade || 100);
    }, 0) || 0;
    
    const mediaCapacidade = dados.analistas?.length > 0 ? 
        Math.round(capacidadeTotal / dados.analistas.length) : 0;
    
    document.getElementById('capacidade-total').textContent = `${mediaCapacidade}%`;
}

function preencherFiltros() {
    // Preencher filtro de analistas
    const selectAnalistas = document.getElementById('filtro-analista');
    selectAnalistas.innerHTML = '<option value="">Todos os Analistas</option>';
    
    dadosAnalistas.forEach(analista => {
        const option = document.createElement('option');
        option.value = analista.nome;
        option.textContent = analista.nome;
        selectAnalistas.appendChild(option);
    });
    
    // Preencher filtro de projetos
    const selectProjetos = document.getElementById('filtro-projeto');
    selectProjetos.innerHTML = '<option value="">Todos os Projetos</option>';
    
    dadosProjetos.forEach(projeto => {
        const option = document.createElement('option');
        option.value = projeto.nome;
        option.textContent = projeto.nome;
        selectProjetos.appendChild(option);
    });
    
    // Preencher select de capacidade
    const selectCapacidade = document.getElementById('analista-capacidade');
    selectCapacidade.innerHTML = '<option value="">Selecione um Analista</option>';
    
    dadosAnalistas.forEach(analista => {
        const option = document.createElement('option');
        option.value = analista.nome;
        option.textContent = analista.nome;
        selectCapacidade.appendChild(option);
    });
}

function configurarFiltros() {
    // Configurar listeners dos filtros
    document.getElementById('filtro-analista').addEventListener('change', function() {
        filtrosAtivos.analista = this.value;
    });
    
    document.getElementById('filtro-projeto').addEventListener('change', function() {
        filtrosAtivos.projeto = this.value;
    });
    
    document.getElementById('filtro-tipo').addEventListener('change', function() {
        filtrosAtivos.tipo = this.value;
    });
    
    document.getElementById('data-inicial').addEventListener('change', function() {
        filtrosAtivos.dataInicial = this.value;
    });
}

// ========================================
// FUNÇÕES DE FILTROS
// ========================================

function aplicarFiltros() {
    console.log('🔍 Aplicando filtros:', filtrosAtivos);
    calendar.refetchEvents();
}

function limparFiltros() {
    console.log('🧹 Limpando filtros...');
    
    // Limpar valores
    document.getElementById('filtro-analista').value = '';
    document.getElementById('filtro-projeto').value = '';
    document.getElementById('filtro-tipo').value = '';
    
    // Limpar objeto de filtros
    filtrosAtivos = {
        analista: '',
        projeto: '',
        tipo: '',
        dataInicial: filtrosAtivos.dataInicial // Manter data inicial
    };
    
    // Recarregar eventos
    calendar.refetchEvents();
}



// ========================================
// FUNÇÕES DE SALVAMENTO
// ========================================

async function salvarPosicaoEvento(evento) {
    try {
        const dados = {
            id: evento.id,
            dataInicio: evento.start.toISOString(),
            dataFim: evento.end.toISOString()
        };
        
        const response = await fetch('/api/salvar-planejamento', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });
        
        if (response.ok) {
            console.log('✅ Posição do evento salva!');
            mostrarSucesso('Tarefa atualizada com sucesso!');
        } else {
            throw new Error('Erro ao salvar posição');
        }
        
    } catch (error) {
        console.error('❌ Erro ao salvar posição:', error);
        mostrarErro('Erro ao salvar alterações');
        calendar.refetchEvents(); // Reverter mudanças
    }
}

async function salvarDuracaoEvento(evento) {
    try {
        const duracao = evento.end - evento.start;
        const horas = Math.round(duracao / (1000 * 60 * 60));
        
        const dados = {
            id: evento.id,
            horas: horas
        };
        
        const response = await fetch('/api/salvar-planejamento', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });
        
        if (response.ok) {
            console.log('✅ Duração do evento salva!');
            mostrarSucesso('Duração atualizada com sucesso!');
        } else {
            throw new Error('Erro ao salvar duração');
        }
        
    } catch (error) {
        console.error('❌ Erro ao salvar duração:', error);
        mostrarErro('Erro ao salvar alterações');
        calendar.refetchEvents(); // Reverter mudanças
    }
}

async function salvarCapacidade() {
    const analista = document.getElementById('analista-capacidade').value;
    const data = document.getElementById('data-capacidade').value;
    const capacidade = document.getElementById('capacidade-valor').value;
    
    if (!analista || !data || !capacidade) {
        mostrarErro('Preencha todos os campos!');
        return;
    }
    
    try {
        const dados = {
            analista: analista,
            data: data,
            capacidade: parseInt(capacidade)
        };
        
        const response = await fetch('/api/salvar-capacidade', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });
        
        if (response.ok) {
            console.log('✅ Capacidade salva!');
            mostrarSucesso('Capacidade configurada com sucesso!');
            
            // Limpar campos
            document.getElementById('data-capacidade').value = '';
            document.getElementById('capacidade-valor').value = '100';
            
            // Recarregar calendário
            calendar.refetchEvents();
            
        } else {
            throw new Error('Erro ao salvar capacidade');
        }
        
    } catch (error) {
        console.error('❌ Erro ao salvar capacidade:', error);
        mostrarErro('Erro ao salvar capacidade');
    }
}

// ========================================
// FUNÇÕES DE INTERFACE
// ========================================

function mostrarDetalhesEvento(evento) {
    const props = evento.extendedProps;
    
    let detalhes = `
        <strong>${evento.title}</strong><br>
        <strong>Analista:</strong> ${props.analista || 'N/A'}<br>
        <strong>Projeto:</strong> ${props.projeto || 'N/A'}<br>
        <strong>Tipo:</strong> ${props.tipo || 'N/A'}<br>
        <strong>Horas:</strong> ${props.horas || 'N/A'}<br>
        <strong>Início:</strong> ${evento.start.toLocaleString('pt-BR')}<br>
        <strong>Fim:</strong> ${evento.end.toLocaleString('pt-BR')}
    `;
    
    if (props.descricao) {
        detalhes += `<br><strong>Descrição:</strong> ${props.descricao}`;
    }
    
    alert(detalhes);
}

function mostrarSucesso(mensagem) {
    // Implementar toast de sucesso
    console.log('✅', mensagem);
}

function mostrarErro(mensagem) {
    // Implementar toast de erro
    console.error('❌', mensagem);
    alert('Erro: ' + mensagem);
}

// ========================================
// FUNÇÕES DE UTILIDADE
// ========================================

// Função para formatar data
function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR');
}

// Função para formatar hora
function formatarHora(data) {
    return new Date(data).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

console.log('📅 Script do Planner Semanal Corrigido carregado!');
