#!/bin/bash

echo "🧹 Limpando arquivos SQLite antigos..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Encontrar arquivos SQLite
SQLITE_FILES=$(find . -name "*.db" -o -name "*.sqlite" -o -name "*.sqlite3" 2>/dev/null)

if [ -n "$SQLITE_FILES" ]; then
    echo -e "${YELLOW}📁 Arquivos SQLite encontrados:${NC}"
    echo "$SQLITE_FILES"
    echo ""
    
    read -p "🗑️  Deseja remover estes arquivos? (s/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        while IFS= read -r file; do
            echo -e "${YELLOW}Removendo: $file${NC}"
            rm -f "$file"
        done <<< "$SQLITE_FILES"
        echo -e "${GREEN}✅ Arquivos SQLite removidos com sucesso!${NC}"
    else
        echo -e "${YELLOW}⏭️  Operação cancelada${NC}"
    fi
else
    echo -e "${GREEN}✅ Nenhum arquivo SQLite encontrado${NC}"
fi

# Verificar se há arquivos SQLite no Git
SQLITE_IN_GIT=$(git ls-files | grep -E "\.(db|sqlite|sqlite3)$" 2>/dev/null || true)
if [ -n "$SQLITE_IN_GIT" ]; then
    echo -e "${RED}⚠️  Arquivos SQLite encontrados no Git:${NC}"
    echo "$SQLITE_IN_GIT"
    echo ""
    
    read -p "🗑️  Deseja removê-los do Git? (s/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        echo "$SQLITE_IN_GIT" | while read -r file; do
            echo -e "${YELLOW}Removendo do Git: $file${NC}"
            git rm --cached "$file" 2>/dev/null || true
        done
        echo -e "${GREEN}✅ Arquivos SQLite removidos do Git!${NC}"
        echo -e "${YELLOW}💡 Não esqueça de fazer commit das alterações${NC}"
    fi
fi 