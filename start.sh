#!/bin/bash

echo "========================================"
echo "   Dashboard PMO - FIERGS"
echo "========================================"
echo

echo "[1/3] Verificando se o arquivo JSON existe..."
if [ ! -f "data/dashboard-data.json" ]; then
    echo "Arquivo JSON não encontrado. Processando CSV..."
    node scripts/process-csv.js
    if [ $? -ne 0 ]; then
        echo "ERRO: Falha ao processar CSV"
        exit 1
    fi
else
    echo "Arquivo JSON encontrado!"
fi

echo
echo "[2/3] Verificando dependências..."
if [ ! -d "node_modules" ]; then
    echo "Instalando dependências..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERRO: Falha ao instalar dependências"
        exit 1
    fi
fi

echo
echo "[3/3] Iniciando servidor..."
echo
echo "Dashboard será aberto em: http://localhost:3000"
echo "Pressione Ctrl+C para parar o servidor"
echo
node server.js 