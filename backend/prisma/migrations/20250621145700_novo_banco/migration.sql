-- CreateTable
CREATE TABLE "Proof" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "titulo" TEXT NOT NULL,
    "banca" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "totalQuestoes" INTEGER NOT NULL,
    "tipoPontuacao" TEXT,
    "aproveitamento" DOUBLE PRECISION,
    "inscritos" INTEGER,
    "gabaritoPreliminar" TEXT,
    "gabaritoDefinitivo" TEXT,
    "userAnswers" TEXT,
    "simulacaoAnuladas" TEXT,
    "type" TEXT NOT NULL DEFAULT 'CONCURSO',
    "simulacaoMedia" DOUBLE PRECISION,
    "simulacaoDesvioPadrao" DOUBLE PRECISION,
    "simulacaoNotaDeCorte" DOUBLE PRECISION,
    "orgao" TEXT,
    "cargo" TEXT,
    "notaDiscursiva" DOUBLE PRECISION,
    "resultadoObjetiva" JSONB,
    "resultadoDiscursiva" JSONB,
    "resultadoFinal" JSONB,
    "regraAnulacao" TEXT DEFAULT 'PADRAO',
    "valorAnulacao" DOUBLE PRECISION DEFAULT 1.0,
    "formulaAnulacao" TEXT,
    "tipoNotaCorte" TEXT DEFAULT 'DECIMAL',
    "precisaoDecimal" INTEGER DEFAULT 1,

    CONSTRAINT "Proof_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "questoes" INTEGER NOT NULL,
    "questaoInicio" INTEGER NOT NULL,
    "questaoFim" INTEGER NOT NULL,
    "proofId" INTEGER NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Result" (
    "id" SERIAL NOT NULL,
    "disciplina" TEXT NOT NULL,
    "acertos" INTEGER NOT NULL,
    "erros" INTEGER NOT NULL,
    "brancos" INTEGER NOT NULL,
    "anuladas" INTEGER NOT NULL,
    "proofId" INTEGER NOT NULL,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_proofId_fkey" FOREIGN KEY ("proofId") REFERENCES "Proof"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_proofId_fkey" FOREIGN KEY ("proofId") REFERENCES "Proof"("id") ON DELETE CASCADE ON UPDATE CASCADE;
