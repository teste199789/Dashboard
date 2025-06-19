const { PrismaClient } = require('@prisma/client');
const { obterConfiguracaoPadraoBanca } = require('../utils/regrasAnulacao');

const prisma = new PrismaClient();

async function atualizarConfiguracoesBanca() {
    console.log('🔄 Iniciando atualização de configurações de banca...');
    
    try {
        // Buscar todas as provas que não têm configurações definidas
        const provas = await prisma.proof.findMany({
            where: {
                OR: [
                    { regraAnulacao: null },
                    { tipoPontuacao: null }
                ]
            }
        });

        console.log(`📊 Encontradas ${provas.length} provas para atualizar`);

        let atualizadas = 0;
        
        for (const prova of provas) {
            const config = obterConfiguracaoPadraoBanca(prova.banca);
            
            const dadosAtualizacao = {};
            
            // Aplicar configurações apenas se não estiverem definidas
            if (!prova.regraAnulacao) dadosAtualizacao.regraAnulacao = config.regraAnulacao;
            if (!prova.valorAnulacao) dadosAtualizacao.valorAnulacao = config.valorAnulacao;
            if (!prova.tipoNotaCorte) dadosAtualizacao.tipoNotaCorte = config.tipoNotaCorte;
            if (!prova.precisaoDecimal) dadosAtualizacao.precisaoDecimal = config.precisaoDecimal;
            if (!prova.tipoPontuacao) dadosAtualizacao.tipoPontuacao = config.tipoPontuacao;
            
            if (Object.keys(dadosAtualizacao).length > 0) {
                await prisma.proof.update({
                    where: { id: prova.id },
                    data: dadosAtualizacao
                });
                
                console.log(`✅ Prova ${prova.id} (${prova.banca}): ${JSON.stringify(dadosAtualizacao)}`);
                atualizadas++;
            }
        }

        console.log(`🎉 Atualização concluída! ${atualizadas} provas atualizadas.`);
        
        // Mostrar estatísticas finais
        const estatisticas = await prisma.proof.groupBy({
            by: ['banca', 'tipoPontuacao'],
            _count: {
                id: true
            }
        });

        console.log('\n📈 Estatísticas finais:');
        estatisticas.forEach(stat => {
            console.log(`   ${stat.banca}: ${stat.tipoPontuacao} (${stat._count.id} provas)`);
        });

    } catch (error) {
        console.error('❌ Erro durante a atualização:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    atualizarConfiguracoesBanca()
        .then(() => {
            console.log('✨ Script executado com sucesso!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Falha na execução do script:', error);
            process.exit(1);
        });
}

module.exports = { atualizarConfiguracoesBanca }; 