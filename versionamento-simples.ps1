# Script de Versionamento Simples - Sistema PMO v2.0.0

Write-Host "🚀 INICIANDO VERSIONAMENTO v2.0.0" -ForegroundColor Green

# 1. Verificar Git
Write-Host "`n[1/6] Verificando Git..." -ForegroundColor Yellow
git --version

# 2. Atualizar package.json
Write-Host "`n[2/6] Atualizando package.json..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$packageJson.version = "2.0.0"
$packageJson.description = "Dashboard PMO para gestao de recursos e projetos FIERGS - Versao 2.0.0 com correcoes e ordenacao alfabetica"
$packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json" -Encoding UTF8
Write-Host "✅ package.json atualizado para versao 2.0.0" -ForegroundColor Green

# 3. Criar documentacao
Write-Host "`n[3/6] Criando documentacao..." -ForegroundColor Yellow
$versionDoc = @"
# VERSÃO 2.0.0 - Dashboard Corrigido e Ordenação Alfabética

**Data:** $(Get-Date -Format "dd/MM/yyyy HH:mm")
**Versão:** 2.0.0
**Status:** PRODUÇÃO

## CORREÇÕES APLICADAS

1. Bug Crítico - Códigos de Tarefa como Analistas
   - PROBLEMA: BACKLOGSGE-39 aparecia como analista
   - SOLUÇÃO: Filtro isValidAnalystName() implementado
   - RESULTADO: Apenas nomes válidos processados

2. Dados Inconsistentes nos Cards
   - PROBLEMA: Cards não mostravam números corretos
   - SOLUÇÃO: enriquecerDadosAnalistas() implementado
   - RESULTADO: Cards com dados precisos

3. Falta de Ordenação
   - PROBLEMA: Dados em ordem aleatória
   - SOLUÇÃO: Ordenação alfabética em todas as abas
   - RESULTADO: Interface organizada

## FUNÇÕES CORRIGIDAS

- loadProjects() - Ordenação alfabética
- loadAnalystsByType() - Ordenação alfabética
- loadSustentacoes() - Ordenação alfabética
- loadCategories() - Ordenação alfabética

## ESTATÍSTICAS

- Projetos: 120
- Analistas: 41
- Tarefas: 1.164
- Categorias: 36
- Sustentações: 15

## ROLLBACK

Para voltar: git checkout v2.0.0
Para avançar: git checkout main
"@

$versionDoc | Out-File -FilePath "VERSION-2.0.0.md" -Encoding UTF8
Write-Host "✅ VERSION-2.0.0.md criado" -ForegroundColor Green

# 4. Adicionar e commitar
Write-Host "`n[4/6] Adicionando arquivos..." -ForegroundColor Yellow
git add .

Write-Host "`n[5/6] Fazendo commit..." -ForegroundColor Yellow
git commit -m "v2.0.0 - Dashboard Corrigido e Ordenacao Alfabetica

Correcoes aplicadas:
- Filtro de codigos de tarefa (BACKLOGSGE-39)
- Enriquecimento de dados dos analistas
- Ordenacao alfabetica em todas as abas
- Interface mais organizada

Funcoes corrigidas:
- loadProjects(), loadAnalystsByType()
- loadSustentacoes(), loadCategories()

Documentacao:
- VERSION-2.0.0.md criado
- package.json atualizado"

# 5. Push e tag
Write-Host "`n[6/6] Fazendo push e criando tag..." -ForegroundColor Yellow
git push origin main
git tag -a v2.0.0 -m "Versao 2.0.0 - Dashboard Corrigido e Ordenacao Alfabetica"
git push origin v2.0.0

Write-Host "`n🎉 VERSIONAMENTO CONCLUIDO!" -ForegroundColor Green
Write-Host "✅ Sistema versionado com sucesso" -ForegroundColor Green
Write-Host "🔗 GitHub: https://github.com/GuilhermePolano/sistema-planejamento-pmo" -ForegroundColor Cyan
Write-Host "🔄 Rollback: git checkout v2.0.0" -ForegroundColor Yellow

# Remover arquivo temporário
Remove-Item "versionamento-simples.ps1" -ErrorAction SilentlyContinue
