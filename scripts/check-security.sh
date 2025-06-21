#!/bin/bash

echo "🔍 Verificando segurança do projeto..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ISSUES_FOUND=0
CRITICAL_ISSUES=()

# Função para adicionar problema crítico
add_critical_issue() {
    CRITICAL_ISSUES+=("$1")
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
}

echo -e "\n${BLUE}=== VERIFICAÇÃO DE ARQUIVOS SENSÍVEIS ===${NC}"

# 1. Verificar se .env existe e não está no git
echo -e "\n📁 Verificando arquivo .env..."
if [ -f ".env" ]; then
    if git check-ignore .env > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Arquivo .env está sendo ignorado pelo Git${NC}"
    else
        echo -e "${RED}❌ CRÍTICO: Arquivo .env NÃO está sendo ignorado pelo Git!${NC}"
        add_critical_issue "Arquivo .env não está no .gitignore"
    fi
else
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado${NC}"
fi

# 2. Verificar se .env.example existe
echo -e "\n📄 Verificando arquivo .env.example..."
if [ -f ".env.example" ]; then
    echo -e "${GREEN}✅ Arquivo .env.example encontrado${NC}"
else
    echo -e "${YELLOW}⚠️  Arquivo .env.example não encontrado${NC}"
fi

# 3. Verificar arquivos SQLite antigos
echo -e "\n🗄️  Verificando arquivos SQLite antigos..."
SQLITE_FILES=$(find . -name "*.db" -o -name "*.sqlite" -o -name "*.sqlite3" 2>/dev/null | head -10)
if [ -n "$SQLITE_FILES" ]; then
    echo -e "${YELLOW}⚠️  Arquivos SQLite encontrados:${NC}"
    while IFS= read -r db_file; do
        echo "   - $db_file"
        if ! git check-ignore "$db_file" > /dev/null 2>&1; then
            echo -e "${RED}     ❌ CRÍTICO: NÃO está sendo ignorado pelo Git!${NC}"
            add_critical_issue "Arquivo SQLite $db_file não está sendo ignorado"
        else
            echo -e "${GREEN}     ✅ Está sendo ignorado${NC}"
        fi
    done <<< "$SQLITE_FILES"
else
    echo -e "${GREEN}✅ Nenhum arquivo SQLite encontrado${NC}"
fi

# 4. Verificar diretório de backups
echo -e "\n💾 Verificando diretório de backups..."
if [ -d "backups" ]; then
    if git check-ignore backups > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Diretório backups está sendo ignorado pelo Git${NC}"
    else
        echo -e "${RED}❌ CRÍTICO: Diretório backups NÃO está sendo ignorado pelo Git!${NC}"
        add_critical_issue "Diretório backups não está sendo ignorado"
    fi
else
    echo -e "${YELLOW}⚠️  Diretório backups não existe${NC}"
fi

# 5. Verificar arquivos .env* no Git
echo -e "\n🔐 Verificando arquivos .env* no Git..."
ENV_FILES_IN_GIT=$(git ls-files 2>/dev/null | grep -E "\.env$|\.env\." || true)
if [ -n "$ENV_FILES_IN_GIT" ]; then
    echo -e "${RED}❌ CRÍTICO: Arquivos .env encontrados no Git:${NC}"
    echo "$ENV_FILES_IN_GIT" | while read -r file; do
        echo -e "${RED}   - $file${NC}"
        add_critical_issue "Arquivo .env $file está sendo trackeado pelo Git"
    done
else
    echo -e "${GREEN}✅ Nenhum arquivo .env sendo trackeado${NC}"
fi

# 6. Verificar arquivos de backup no Git (EXCLUINDO migrações do Prisma)
echo -e "\n💾 Verificando arquivos de backup no Git..."
BACKUP_FILES_IN_GIT=$(git ls-files 2>/dev/null | grep -E "\.(backup|bak|sql\.gz|dump)$" | grep -v "prisma/migrations" || true)
if [ -n "$BACKUP_FILES_IN_GIT" ]; then
    echo -e "${RED}❌ CRÍTICO: Arquivos de backup encontrados no Git:${NC}"
    echo "$BACKUP_FILES_IN_GIT" | while read -r file; do
        echo -e "${RED}   - $file${NC}"
        add_critical_issue "Arquivo de backup $file está sendo trackeado pelo Git"
    done
else
    echo -e "${GREEN}✅ Nenhum arquivo de backup sendo trackeado${NC}"
fi

# 7. Verificar migrações do Prisma (devem estar no Git)
echo -e "\n🔄 Verificando migrações do Prisma..."
PRISMA_MIGRATIONS=$(find . -path "*/prisma/migrations/*.sql" 2>/dev/null)
if [ -n "$PRISMA_MIGRATIONS" ]; then
    echo -e "${GREEN}✅ Migrações do Prisma encontradas (correto):${NC}"
    echo "$PRISMA_MIGRATIONS" | while read -r file; do
        echo -e "${GREEN}   - $file${NC}"
    done
else
    echo -e "${YELLOW}⚠️  Nenhuma migração do Prisma encontrada${NC}"
fi

# 8. Verificar arquivos SQLite no Git
echo -e "\n🗄️  Verificando arquivos SQLite no Git..."
SQLITE_IN_GIT=$(git ls-files 2>/dev/null | grep -E "\.(db|sqlite|sqlite3)$" || true)
if [ -n "$SQLITE_IN_GIT" ]; then
    echo -e "${RED}❌ CRÍTICO: Arquivos SQLite encontrados no Git:${NC}"
    echo "$SQLITE_IN_GIT" | while read -r file; do
        echo -e "${RED}   - $file${NC}"
        add_critical_issue "Arquivo SQLite $file está sendo trackeado pelo Git"
    done
else
    echo -e "${GREEN}✅ Nenhum arquivo SQLite sendo trackeado${NC}"
fi

# 9. Verificar se .gitignore existe
echo -e "\n📝 Verificando arquivo .gitignore..."
if [ -f ".gitignore" ]; then
    echo -e "${GREEN}✅ Arquivo .gitignore existe${NC}"
    
    # Verificar se tem as entradas essenciais
    MISSING_ENTRIES=()
    
    if ! grep -q "\.env" .gitignore; then
        MISSING_ENTRIES+=(".env")
    fi
    
    if ! grep -q "backups" .gitignore; then
        MISSING_ENTRIES+=("backups/")
    fi
    
    if ! grep -q "\*\.db\|\*\.sqlite" .gitignore; then
        MISSING_ENTRIES+=("*.db ou *.sqlite")
    fi
    
    if [ ${#MISSING_ENTRIES[@]} -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Entradas importantes faltando no .gitignore:${NC}"
        for entry in "${MISSING_ENTRIES[@]}"; do
            echo -e "${YELLOW}   - $entry${NC}"
        done
    fi
else
    echo -e "${RED}❌ CRÍTICO: Arquivo .gitignore não existe!${NC}"
    add_critical_issue "Arquivo .gitignore não existe"
fi

# 10. Verificar arquivos de backup reais no diretório backups/
echo -e "\n🗂️  Verificando arquivos no diretório backups..."
if [ -d "backups" ]; then
    BACKUP_FILES=$(find backups/ -type f 2>/dev/null | head -5)
    if [ -n "$BACKUP_FILES" ]; then
        echo -e "${YELLOW}⚠️  Arquivos encontrados no diretório backups:${NC}"
        echo "$BACKUP_FILES" | while read -r file; do
            echo "   - $file"
            if ! git check-ignore "$file" > /dev/null 2>&1; then
                echo -e "${RED}     ❌ CRÍTICO: NÃO está sendo ignorado pelo Git!${NC}"
                add_critical_issue "Arquivo de backup $file não está sendo ignorado"
            else
                echo -e "${GREEN}     ✅ Está sendo ignorado${NC}"
            fi
        done
    else
        echo -e "${GREEN}✅ Diretório backups vazio${NC}"
    fi
fi

echo -e "\n${BLUE}=== RESUMO FINAL ===${NC}"

if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "\n${GREEN}🎉 SUCESSO: Nenhum problema crítico de segurança encontrado!${NC}"
    echo -e "${GREEN}✅ Projeto seguro para commit${NC}"
    echo -e "${GREEN}✅ Migrações do Prisma estão corretamente no Git${NC}"
else
    echo -e "\n${RED}❌ PROBLEMAS CRÍTICOS ENCONTRADOS: $ISSUES_FOUND${NC}"
    echo -e "${RED}🚫 NÃO faça commit até corrigir os problemas${NC}"
    
    echo -e "\n${YELLOW}📋 Lista de problemas críticos:${NC}"
    for i in "${!CRITICAL_ISSUES[@]}"; do
        echo -e "${RED}   $((i+1)). ${CRITICAL_ISSUES[i]}${NC}"
    done
    
    echo -e "\n${YELLOW}🔧 Comandos de correção sugeridos:${NC}"
    
    # Verificar arquivos sensíveis (excluindo migrações do Prisma)
    SENSITIVE_FILES=$(git ls-files 2>/dev/null | grep -E "\.(env|db|sqlite|backup|bak|sql\.gz|dump)$" | grep -v "prisma/migrations" || true)
    if [ -n "$SENSITIVE_FILES" ]; then
        echo -e "${YELLOW}   # Remover arquivos sensíveis do Git:${NC}"
        echo "$SENSITIVE_FILES" | while read -r file; do
            echo -e "${YELLOW}   git rm --cached '$file'${NC}"
        done
    fi
    
    if [ ! -f ".gitignore" ]; then
        echo -e "${YELLOW}   # Criar .gitignore básico:${NC}"
        echo -e "${YELLOW}   touch .gitignore${NC}"
    fi
    
    echo -e "\n${YELLOW}   # Após as correções, execute novamente:${NC}"
    echo -e "${YELLOW}   ./scripts/check-security.sh${NC}"
fi

echo -e "\n${BLUE}💡 Nota: Arquivos de migração do Prisma (*.sql em prisma/migrations/) são normais e devem estar no Git.${NC}"

exit $ISSUES_FOUND 