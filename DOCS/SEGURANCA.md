# 🔒 Guia de Segurança - Dashboard de Provas

## 📋 Visão Geral

Este documento estabelece as diretrizes de segurança para o projeto Dashboard de Provas, garantindo que informações sensíveis nunca sejam expostas acidentalmente.

## ❌ Arquivos que NUNCA devem ser commitados

### Arquivos de Configuração Sensíveis
- `.env` (credenciais reais)
- `.env.local`, `.env.production.local`
- Qualquer arquivo contendo senhas, tokens ou chaves de API

### Arquivos de Banco de Dados
- `*.db`, `*.sqlite`, `*.sqlite3` (arquivos SQLite antigos)
- Arquivos de backup: `*.backup`, `*.bak`, `*.sql.gz`, `*.dump`
- Conteúdo do diretório `backups/`

### Arquivos Temporários e Logs
- Logs com informações sensíveis
- Arquivos temporários com credenciais

## ✅ Arquivos que DEVEM ser commitados

### Arquivos de Configuração de Exemplo
- `.env.example` (com valores placeholder)
- Arquivos de configuração do Docker
- Scripts de inicialização

### Migrações do Banco de Dados
- `backend/prisma/migrations/**/*.sql` (migrações do Prisma)
- `backend/prisma/schema.prisma`

## 🔧 Configuração de Segurança

### 1. Arquivo .gitignore Obrigatório

O projeto deve sempre ter um `.gitignore` com as seguintes entradas mínimas:

```gitignore
# Arquivos de ambiente (CRÍTICO)
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Bancos de dados locais
*.db
*.sqlite
*.sqlite3

# Arquivos de backup
*.backup
*.bak
backups/
*.sql.gz
*.dump

# Dependências
node_modules/
```

### 2. Configuração Inicial Segura

```bash
# 1. Copiar arquivo de exemplo
cp .env.example .env

# 2. Editar com credenciais reais
nano .env  # ou seu editor preferido

# 3. Verificar se está sendo ignorado
git status  # .env não deve aparecer

# 4. Verificar segurança antes de commit
./scripts/check-security.sh
```

## 🛡️ Scripts de Segurança

### Verificação Automática de Segurança

Execute sempre antes de fazer commit:

```bash
./scripts/check-security.sh
```

**O que verifica:**
- ✅ Arquivos `.env` não estão no Git
- ✅ Arquivos de backup não estão sendo trackeados
- ✅ Arquivos SQLite antigos foram removidos
- ✅ `.gitignore` está configurado corretamente
- ✅ Migrações do Prisma estão corretas
- ⚠️ Possíveis credenciais hardcoded no código

### Limpeza de Arquivos SQLite Antigos

```bash
./scripts/cleanup-sqlite.sh
```

Remove arquivos SQLite antigos do sistema e do Git (projeto migrou para PostgreSQL).

## 🚨 Procedimento de Emergência

### Se você commitou informações sensíveis acidentalmente:

#### 1. **NÃO faça push** se ainda não fez

#### 2. **Remova do último commit:**
```bash
git reset --soft HEAD~1
git rm --cached .env  # ou arquivo sensível
git commit -m "Remove arquivo sensível"
```

#### 3. **Se já fez push:**
```bash
# CUIDADO: Isso reescreve o histórico
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env' --prune-empty --tag-name-filter cat -- --all
git push --force-with-lease
```

#### 4. **Mude todas as credenciais expostas imediatamente**

#### 5. **Notifique a equipe sobre a mudança de credenciais**

## 🔍 Auditoria de Segurança

### Verificação Manual Periódica

```bash
# Verificar arquivos sensíveis no Git
git ls-files | grep -E "\.(env|db|sqlite|backup|bak|sql\.gz)$"

# Procurar credenciais hardcoded
grep -r -i "password\|secret\|key\|token" --exclude-dir=node_modules --exclude="*.md" .

# Verificar status do .gitignore
git check-ignore .env || echo "PROBLEMA: .env não está sendo ignorado!"
```

### Checklist de Auditoria Mensal

- [ ] Verificar se novos desenvolvedores configuraram `.env` corretamente
- [ ] Revisar arquivos que foram adicionados ao Git
- [ ] Verificar se scripts de segurança estão sendo executados
- [ ] Rotacionar credenciais de produção
- [ ] Verificar logs de backup para vazamentos

## 🔐 Boas Práticas de Desenvolvimento

### Para Desenvolvedores

1. **Sempre execute verificação de segurança:**
   ```bash
   ./scripts/check-security.sh
   ```

2. **Use credenciais diferentes para cada ambiente:**
   - Desenvolvimento: credenciais simples
   - Produção: credenciais complexas e únicas

3. **Nunca compartilhe credenciais por:**
   - Chat/Slack
   - Email
   - Comentários no código
   - Commits

4. **Use placeholders em exemplos:**
   ```env
   # ❌ Errado
   POSTGRES_PASSWORD=minhasenha123
   
   # ✅ Correto
   POSTGRES_PASSWORD=SUA_SENHA_SEGURA_AQUI
   ```

### Para Administradores

1. **Configure hooks de pre-commit:**
   ```bash
   # .git/hooks/pre-commit
   #!/bin/bash
   ./scripts/check-security.sh
   ```

2. **Monitore commits para arquivos sensíveis**

3. **Implemente rotação regular de credenciais**

4. **Mantenha backups seguros e criptografados**

## 📊 Configurações por Ambiente

### Desenvolvimento
- Credenciais simples e locais
- Banco PostgreSQL em container
- Logs detalhados permitidos

### Produção
- Credenciais complexas e únicas
- Banco PostgreSQL seguro
- Logs sanitizados
- Backups criptografados

## 🆘 Contatos de Emergência

Em caso de vazamento de credenciais:

1. **Mude as credenciais imediatamente**
2. **Execute verificação de segurança**
3. **Documente o incidente**
4. **Notifique a equipe**

## 📚 Recursos Adicionais

- [Documentação do Prisma sobre Migrações](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Boas Práticas de .gitignore](https://git-scm.com/docs/gitignore)
- [Segurança em Containers Docker](https://docs.docker.com/engine/security/)

---

**Lembre-se:** A segurança é responsabilidade de todos os desenvolvedores. Quando em dúvida, execute `./scripts/check-security.sh` antes de fazer commit! 