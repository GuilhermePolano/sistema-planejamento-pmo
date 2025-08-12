const ExcelProcessor = require('../services/excelProcessor');

async function reprocessData() {
    try {
        console.log('🔄 Iniciando reprocessamento dos dados com o novo arquivo CSV...');
        
        const processor = new ExcelProcessor();
        const result = processor.processCSV();
        
        console.log('✅ Dados reprocessados com sucesso!');
        console.log(`📊 Projetos: ${result.projetos.length}`);
        console.log(`👥 Analistas: ${result.analistas.length}`);
        console.log(`📋 Tarefas: ${result.tarefas.length}`);
        console.log(`🔧 Categorias: ${result.categorias.length}`);
        console.log(`🔧 Sustentações: ${result.sustentacoes.length}`);
        
        // Verificar analistas técnicos
        const analistasTecnicos = result.analistasPorFuncao['Analista Técnico'] || [];
        console.log(`\n👨‍💻 Analistas Técnicos: ${analistasTecnicos.length}`);
        
        // Verificar analistas sem tarefas
        const analistasSemTarefas = analistasTecnicos.filter(analista => analista.tarefasAtivas === 0);
        console.log(`⚠️ Analistas Técnicos sem tarefas: ${analistasSemTarefas.length}`);
        
        if (analistasSemTarefas.length > 0) {
            console.log('\n📋 Analistas sem tarefas:');
            analistasSemTarefas.forEach(analista => {
                console.log(`  - ${analista.nome} (${analista.categoria})`);
            });
        }
        
        return result;
        
    } catch (error) {
        console.error('❌ Erro ao reprocessar dados:', error);
        throw error;
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    reprocessData()
        .then(() => {
            console.log('\n✅ Reprocessamento concluído!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Erro no reprocessamento:', error);
            process.exit(1);
        });
}

module.exports = reprocessData;
