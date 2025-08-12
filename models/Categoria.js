const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    analistas: [{
        nome: String,
        dataFinal: Date,
        tarefas: Number,
        disponivel: Boolean
    }],
    descricao: String,
    ativa: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Índices para melhor performance
categoriaSchema.index({ ativa: 1 });

// Método para contar analistas disponíveis
categoriaSchema.methods.analistasDisponiveis = function() {
    return this.analistas.filter(analista => analista.disponivel).length;
};

// Método para contar total de analistas
categoriaSchema.methods.totalAnalistas = function() {
    return this.analistas.length;
};

module.exports = mongoose.model('Categoria', categoriaSchema);
