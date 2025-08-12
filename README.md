# 📊 Sistema de Planejamento Semanal PMO

Sistema completo de gerenciamento de projetos e planejamento semanal desenvolvido para controle de capacidades de analistas técnicos, analistas de negócio e responsáveis técnicos.

## 🎯 Funcionalidades

- **Dashboard Principal**: Visualização de projetos e estatísticas
- **Upload de Dados**: Suporte a CSV e Excel
- **Planejamento Semanal**: Interface de calendário com drag & drop
- **Controle de Capacidade**: Monitoramento de horas por analista
- **Filtros Avançados**: Por projeto, analista e tipo de tarefa

## 🚀 Tecnologias

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Banco de Dados**: MongoDB (opcional) + JSON Files
- **Upload**: Multer, CSV/Excel Parser
- **UI**: Font Awesome, Dragula.js

## 📋 Pré-requisitos

- Node.js (v16.0.0+)
- npm (v8.0.0+)
- MongoDB (opcional)

## ⚙️ Instalação

```bash
# 1. Clone o repositório
git clone [URL_DO_REPOSITORIO]
cd "Novo projeto alocações"

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp config.env.example config.env
# Editar config.env com suas configurações

# 4. Iniciar o servidor
npm start
```

## 🌐 Acessos

- **Dashboard**: http://localhost:3000
- **Upload**: http://localhost:3000/upload
- **Planejamento**: http://localhost:3000/planejamento-semanal.html

## 📁 Estrutura do Projeto

```
├── 📁 data/                    # Dados JSON
├── 📁 models/                  # Modelos MongoDB
├── 📁 routes/                  # Rotas da API
├── 📁 services/                # Serviços
├── 📁 uploads/                 # Arquivos enviados
├── 📄 server.js                # Servidor principal
├── 📄 package.json             # Dependências
└── 📄 config.env               # Configurações
```

## 🔧 Configuração

### Variáveis de Ambiente (config.env)
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/pmo-dashboard
```

## 📊 APIs Disponíveis

- `GET /api/dashboard-data` - Dados do dashboard
- `GET /api/analistas` - Lista de analistas
- `GET /api/projetos` - Lista de projetos
- `POST /api/upload-excel` - Upload de arquivo
- `GET /api/tarefas-planejamento` - Tarefas para planejamento

## 🎨 Funcionalidades do Planejamento

- **Visão Semanal**: Calendário com 7 dias
- **Drag & Drop**: Mover tarefas entre dias
- **Controle de Capacidade**: Monitoramento de horas
- **Filtros**: Por analista e tipo de tarefa
- **Ordenação**: Analistas em ordem alfabética

## 📝 Formato dos Dados

### Estrutura CSV/Excel Esperada
```csv
Projeto,Analista,Função,Tarefa,Status,Data Início,Data Fim,Horas Estimadas
"Projeto A","João Silva","Analista Técnico","Desenvolvimento API","Em Andamento","2025-01-01","2025-01-15",40
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Guilherme Polano**
- GitHub: [@guilhermepolano](https://github.com/guilhermepolano)

## 🙏 Agradecimentos

- Equipe de desenvolvimento
- Contribuidores do projeto
- Comunidade open source

---

⭐ Se este projeto te ajudou, considere dar uma estrela no repositório! 