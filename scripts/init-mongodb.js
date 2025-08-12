const mongoose = require('mongoose');
require('dotenv').config();

// Conectar ao MongoDB
async function connectToMongoDB() {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pmo-fiergs';
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Conectado ao MongoDB com sucesso!');
        console.log(`📊 Database: ${mongoose.connection.name}`);
        console.log(`🔗 URI: ${mongoURI}`);
    } catch (error) {
        console.error('❌ Erro ao conectar ao MongoDB:', error);
        process.exit(1);
    }
}

// Verificar conexão
async function checkConnection() {
    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n📋 Collections existentes:');
        collections.forEach(collection => {
            console.log(`  - ${collection.name}`);
        });
        
        if (collections.length === 0) {
            console.log('  (Nenhuma collection encontrada)');
        }
    } catch (error) {
        console.error('❌ Erro ao listar collections:', error);
    }
}

// Criar índices
async function createIndexes() {
    try {
        console.log('\n🔧 Criando índices...');
        
        // Índices para PlanejamentoSemanal
        const PlanejamentoSemanal = require('../models/PlanejamentoSemanal');
        
        // Aguardar a criação dos índices
        await PlanejamentoSemanal.createIndexes();
        
        console.log('✅ Índices criados com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao criar índices:', error);
    }
}

// Função principal
async function initDatabase() {
    console.log('🚀 Inicializando banco de dados MongoDB...\n');
    
    await connectToMongoDB();
    await checkConnection();
    await createIndexes();
    
    console.log('\n✅ Inicialização do banco de dados concluída!');
    console.log('\n📝 Próximos passos:');
    console.log('  1. Execute o servidor: npm start');
    console.log('  2. Acesse: http://localhost:3000');
    console.log('  3. Use o planejamento semanal para criar seus primeiros planejamentos');
    
    process.exit(0);
}

// Executar se chamado diretamente
if (require.main === module) {
    initDatabase().catch(error => {
        console.error('❌ Erro durante inicialização:', error);
        process.exit(1);
    });
}

module.exports = { connectToMongoDB, checkConnection, createIndexes };
