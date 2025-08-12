@echo off
echo ========================================
echo    Dashboard PMO - FIERGS
echo ========================================
echo.

echo [1/3] Verificando se o arquivo JSON existe...
if not exist "data\dashboard-data.json" (
    echo Arquivo JSON nao encontrado. Processando CSV...
    node scripts\process-csv.js
    if errorlevel 1 (
        echo ERRO: Falha ao processar CSV
        pause
        exit /b 1
    )
) else (
    echo Arquivo JSON encontrado!
)

echo.
echo [2/3] Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
    if errorlevel 1 (
        echo ERRO: Falha ao instalar dependencias
        pause
        exit /b 1
    )
)

echo.
echo [3/3] Iniciando servidor...
echo.
echo Dashboard sera aberto em: http://localhost:3000
echo Pressione Ctrl+C para parar o servidor
echo.
node server.js

pause 