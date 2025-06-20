/**
 * Regras de Anulação por Banca - Sistema Avançado
 * Contempla diferentes formas de tratamento de questões anuladas
 */

/**
 * Tipos de regras de anulação disponíveis
 */
const TIPOS_REGRA_ANULACAO = {
    PADRAO: 'PADRAO',                    // Anulada = +1 ponto (padrão atual)
    CESPE_INTEGRAL: 'CESPE_INTEGRAL',    // Anulada anula 1 certa (cancela 1 erro)
    CESPE_MEIO: 'CESPE_MEIO',           // Anulada anula 0.5 certa
    PERSONALIZADO: 'PERSONALIZADO'       // Valor customizado pelo usuário
};

/**
 * Configurações padrão por banca
 */
const CONFIGURACOES_BANCA = {
    'Cespe/Cebraspe': {
        regraAnulacao: TIPOS_REGRA_ANULACAO.CESPE_INTEGRAL,
        valorAnulacao: 1.0,
        tipoNotaCorte: 'DECIMAL',
        precisaoDecimal: 1,
        tipoPontuacao: 'liquida', // Cespe usa Certo/Errado (líquida)
        descricao: 'Cespe/Cebraspe: Certo/Errado - Anulada cancela 1 erro ou adiciona 1 ponto'
    },
    'FGV': {
        regraAnulacao: TIPOS_REGRA_ANULACAO.PADRAO,
        valorAnulacao: 1.0,
        tipoNotaCorte: 'DECIMAL',
        precisaoDecimal: 1,
        tipoPontuacao: 'bruta', // FGV usa Múltipla Escolha (bruta)
        descricao: 'FGV: Múltipla Escolha - Anulada = +1 ponto'
    },
    'FCC': {
        regraAnulacao: TIPOS_REGRA_ANULACAO.PADRAO,
        valorAnulacao: 1.0,
        tipoNotaCorte: 'INTEIRO',
        precisaoDecimal: 0,
        tipoPontuacao: 'bruta', // FCC usa Múltipla Escolha (bruta)
        descricao: 'FCC: Múltipla Escolha - Anulada = +1 ponto, notas inteiras'
    },
    'Quadrix': {
        regraAnulacao: TIPOS_REGRA_ANULACAO.PADRAO,
        valorAnulacao: 1.0,
        tipoNotaCorte: 'DECIMAL',
        precisaoDecimal: 1,
        tipoPontuacao: 'bruta', // Quadrix usa Múltipla Escolha (bruta)
        descricao: 'Quadrix: Múltipla Escolha - Anulada = +1 ponto'
    },
    'IBFC': {
        regraAnulacao: TIPOS_REGRA_ANULACAO.PADRAO,
        valorAnulacao: 1.0,
        tipoNotaCorte: 'INTEIRO',
        precisaoDecimal: 0,
        tipoPontuacao: 'bruta', // IBFC usa Múltipla Escolha (bruta)
        descricao: 'IBFC: Múltipla Escolha - Anulada = +1 ponto, notas inteiras'
    },
    'Outra': {
        regraAnulacao: TIPOS_REGRA_ANULACAO.PADRAO,
        valorAnulacao: 1.0,
        tipoNotaCorte: 'DECIMAL',
        precisaoDecimal: 1,
        tipoPontuacao: 'bruta', // Padrão para outras bancas
        descricao: 'Outras Bancas: Múltipla Escolha - Anulada = +1 ponto'
    }
};

/**
 * Aplica a regra de anulação específica da banca
 * @param {Object} proof - Dados da prova
 * @param {Object} totals - Totais de acertos, erros, brancos, anuladas
 * @returns {Object} Pontuação calculada com a regra específica
 */
function aplicarRegraAnulacao(proof, totals) {
    const regra = proof.regraAnulacao || TIPOS_REGRA_ANULACAO.PADRAO;
    const valorAnulacao = proof.valorAnulacao || 1.0;
    
    let pontuacaoFinal;
    let detalhesCalculo = {
        regraAplicada: regra,
        valorAnulacao: valorAnulacao,
        explicacao: ''
    };

    switch (regra) {
        case TIPOS_REGRA_ANULACAO.CESPE_INTEGRAL:
            // Para Cespe: anulada cancela 1 erro OU adiciona 1 ponto se não há erros suficientes
            if (proof.tipoPontuacao === 'liquida') {
                // Na pontuação líquida, anuladas já foram contadas como acertos
                // Agora precisamos cancelar erros proporcionalmente
                const errosParaCancelar = Math.min(totals.erros, totals.anuladas);
                const anuldasRestantes = totals.anuladas - errosParaCancelar;
                
                pontuacaoFinal = totals.acertos - (totals.erros - errosParaCancelar);
                detalhesCalculo.explicacao = `Cespe Integral: ${totals.anuladas} anuladas cancelaram ${errosParaCancelar} erros`;
            } else {
                pontuacaoFinal = totals.acertos; // Anuladas já contadas como acertos
                detalhesCalculo.explicacao = `Cespe Integral: ${totals.anuladas} anuladas = +${totals.anuladas} pontos`;
            }
            break;

        case TIPOS_REGRA_ANULACAO.CESPE_MEIO:
            // Anulada vale 0.5 ponto
            if (proof.tipoPontuacao === 'liquida') {
                const pontosAnuladas = totals.anuladas * 0.5;
                pontuacaoFinal = (totals.acertos - totals.anuladas) + pontosAnuladas - totals.erros;
                detalhesCalculo.explicacao = `Cespe Meio: ${totals.anuladas} anuladas × 0.5 = +${pontosAnuladas} pontos`;
            } else {
                const pontosAnuladas = totals.anuladas * 0.5;
                pontuacaoFinal = (totals.acertos - totals.anuladas) + pontosAnuladas;
                detalhesCalculo.explicacao = `Cespe Meio: ${totals.anuladas} anuladas × 0.5 = +${pontosAnuladas} pontos`;
            }
            break;

        case TIPOS_REGRA_ANULACAO.PERSONALIZADO:
            // Valor customizado pelo usuário
            if (proof.tipoPontuacao === 'liquida') {
                const pontosAnuladas = totals.anuladas * valorAnulacao;
                pontuacaoFinal = (totals.acertos - totals.anuladas) + pontosAnuladas - totals.erros;
                detalhesCalculo.explicacao = `Personalizado: ${totals.anuladas} anuladas × ${valorAnulacao} = +${pontosAnuladas} pontos`;
            } else {
                const pontosAnuladas = totals.anuladas * valorAnulacao;
                pontuacaoFinal = (totals.acertos - totals.anuladas) + pontosAnuladas;
                detalhesCalculo.explicacao = `Personalizado: ${totals.anuladas} anuladas × ${valorAnulacao} = +${pontosAnuladas} pontos`;
            }
            break;

        case TIPOS_REGRA_ANULACAO.PADRAO:
        default:
            // Regra padrão atual: anulada = +1 ponto
            if (proof.tipoPontuacao === 'liquida') {
                pontuacaoFinal = totals.acertos - totals.erros;
            } else {
                pontuacaoFinal = totals.acertos;
            }
            detalhesCalculo.explicacao = `Padrão: ${totals.anuladas} anuladas = +${totals.anuladas} pontos`;
            break;
    }

    return {
        pontuacao: Math.max(0, pontuacaoFinal),
        detalhes: detalhesCalculo
    };
}

/**
 * Formata nota de corte baseada nas configurações da banca
 * @param {number} nota - Nota a ser formatada
 * @param {Object} proof - Dados da prova com configurações
 * @returns {string} Nota formatada
 */
function formatarNotaCorte(nota, proof) {
    const tipoNota = proof.tipoNotaCorte || 'DECIMAL';
    const precisao = proof.precisaoDecimal || 1;

    if (tipoNota === 'INTEIRO') {
        return Math.round(nota).toString();
    } else {
        return nota.toFixed(precisao);
    }
}

/**
 * Obtém configuração padrão para uma banca
 * @param {string} nomeBanca - Nome da banca
 * @returns {Object} Configuração padrão
 */
function obterConfiguracaoPadraoBanca(nomeBanca) {
    return CONFIGURACOES_BANCA[nomeBanca] || CONFIGURACOES_BANCA['FGV']; // FGV como fallback
}

/**
 * Gera sugestões de configuração baseadas na banca selecionada
 * @param {string} nomeBanca - Nome da banca
 * @returns {Array} Array de sugestões de configuração
 */
function gerarSugestoesBanca(nomeBanca) {
    const config = obterConfiguracaoPadraoBanca(nomeBanca);
    
    if (nomeBanca === 'Cespe/Cebraspe') {
        return [
            {
                nome: 'Cespe Padrão (Anula 1 Certa)',
                regraAnulacao: TIPOS_REGRA_ANULACAO.CESPE_INTEGRAL,
                valorAnulacao: 1.0,
                descricao: 'Cada anulada cancela 1 erro ou adiciona 1 ponto'
            },
            {
                nome: 'Cespe Meio Ponto',
                regraAnulacao: TIPOS_REGRA_ANULACAO.CESPE_MEIO,
                valorAnulacao: 0.5,
                descricao: 'Cada anulada vale 0.5 ponto'
            }
        ];
    }
    
    return [
        {
            nome: 'Padrão da Banca',
            regraAnulacao: config.regraAnulacao,
            valorAnulacao: config.valorAnulacao,
            descricao: config.descricao
        }
    ];
}

module.exports = {
    TIPOS_REGRA_ANULACAO,
    CONFIGURACOES_BANCA,
    aplicarRegraAnulacao,
    formatarNotaCorte,
    obterConfiguracaoPadraoBanca,
    gerarSugestoesBanca
}; 