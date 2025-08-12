const ExcelProcessor = require('../services/excelProcessor');

async function main() {
    try {
        console.log('🚀 Iniciando processamento do arquivo CSV...');
        
        const processor = new ExcelProcessor();
        const data = processor.processCSV();
        
        console.log('✅ Processamento concluído com sucesso!');
        console.log('📊 Resumo dos dados processados:');
        console.log(`   - Projetos: ${data.projetos.length}`);
        console.log(`   - Analistas: ${data.analistas.length}`);
        console.log(`   - Tarefas: ${data.tarefas.length}`);
        console.log(`   - Categorias: ${data.categorias.length}`);
        
        // Mostrar alguns exemplos
        console.log('\n📋 Exemplos de projetos:');
        data.projetos.slice(0, 3).forEach(projeto => {
            console.log(`   - ${projeto.nome} (${projeto.squad})`);
        });
        
        console.log('\n👥 Exemplos de analistas:');
        data.analistas.slice(0, 3).forEach(analista => {
            console.log(`   - ${analista.nome} (${analista.categoria})`);
        });
        
        console.log('\n🔧 Categorias encontradas:');
        data.categorias.forEach(categoria => {
            console.log(`   - ${categoria.nome}: ${categoria.analistas.length} analistas`);
        });
        
    } catch (error) {
        console.error('❌ Erro durante o processamento:', error);
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main();
}

module.exports = main; 