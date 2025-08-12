const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: './config.env' });

// Importar rotas da API
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar ao MongoDB (opcional - não bloquear se não estiver disponível)
async function connectToMongoDB() {
    try {
        const mongoose = require('mongoose');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dashboard_pmo_fiergs', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout de 5 segundos
        });
        console.log('✅ Conectado ao MongoDB com sucesso!');
        return true;
    } catch (error) {
        console.log('⚠️ MongoDB não disponível - usando arquivos JSON como fallback');
        console.log('   Para usar MongoDB, certifique-se de que está rodando em localhost:27017');
        return false;
    }
}

// Tentar conectar ao MongoDB sem bloquear o servidor
connectToMongoDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname)));

// Usar rotas da API
app.use('/api', apiRoutes);
app.use('/api/planejamento', require('./routes/planejamento'));

// Rota para servir o arquivo JSON de dados
app.get('/data/dashboard-data.json', (req, res) => {
    const jsonPath = path.join(__dirname, 'data', 'dashboard-data.json');
    
    if (fs.existsSync(jsonPath)) {
        res.setHeader('Content-Type', 'application/json');
        res.sendFile(jsonPath);
    } else {
        res.status(404).json({
            success: false,
            message: 'Arquivo de dados não encontrado. Execute o script de processamento primeiro.'
        });
    }
});

// Rota principal - serve o dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Rota para upload de arquivo Excel (interface)
app.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, 'upload.html'));
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
    console.error('Erro:', error);
    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno'
    });
});

// Rota 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Rota não encontrada'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 Dashboard disponível em: http://localhost:${PORT}`);
    console.log(`📤 Upload de arquivos em: http://localhost:${PORT}/upload`);
    console.log(`🔄 Reprocessar dados: http://localhost:${PORT}/api/reprocess-data`);
    console.log(`📄 Dados JSON: http://localhost:${PORT}/data/dashboard-data.json`);
    console.log(`📅 Planejamento Semanal: http://localhost:${PORT}/planejamento-semanal.html`);
    console.log(`🧪 Teste da Aplicação: http://localhost:${PORT}/teste-aplicacao.html`);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
}); 