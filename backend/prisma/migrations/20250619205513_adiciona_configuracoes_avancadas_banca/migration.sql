/*
  Warnings:

  - You are about to alter the column `resultadoObjetiva` on the `Proof` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Proof" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "titulo" TEXT NOT NULL,
    "banca" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "totalQuestoes" INTEGER NOT NULL,
    "tipoPontuacao" TEXT,
    "aproveitamento" REAL,
    "inscritos" INTEGER,
    "gabaritoPreliminar" TEXT,
    "gabaritoDefinitivo" TEXT,
    "userAnswers" TEXT,
    "simulacaoAnuladas" TEXT,
    "type" TEXT NOT NULL DEFAULT 'CONCURSO',
    "simulacaoMedia" REAL,
    "simulacaoDesvioPadrao" REAL,
    "simulacaoNotaDeCorte" REAL,
    "orgao" TEXT,
    "cargo" TEXT,
    "notaDiscursiva" REAL,
    "resultadoObjetiva" JSONB,
    "resultadoDiscursiva" JSONB,
    "resultadoFinal" JSONB,
    "regraAnulacao" TEXT DEFAULT 'PADRAO',
    "valorAnulacao" REAL DEFAULT 1.0,
    "formulaAnulacao" TEXT,
    "tipoNotaCorte" TEXT DEFAULT 'DECIMAL',
    "precisaoDecimal" INTEGER DEFAULT 1
);
INSERT INTO "new_Proof" ("aproveitamento", "banca", "cargo", "createdAt", "data", "gabaritoDefinitivo", "gabaritoPreliminar", "id", "inscritos", "notaDiscursiva", "orgao", "resultadoDiscursiva", "resultadoFinal", "resultadoObjetiva", "simulacaoAnuladas", "simulacaoDesvioPadrao", "simulacaoMedia", "simulacaoNotaDeCorte", "tipoPontuacao", "titulo", "totalQuestoes", "type", "updatedAt", "userAnswers") SELECT "aproveitamento", "banca", "cargo", "createdAt", "data", "gabaritoDefinitivo", "gabaritoPreliminar", "id", "inscritos", "notaDiscursiva", "orgao", "resultadoDiscursiva", "resultadoFinal", "resultadoObjetiva", "simulacaoAnuladas", "simulacaoDesvioPadrao", "simulacaoMedia", "simulacaoNotaDeCorte", "tipoPontuacao", "titulo", "totalQuestoes", "type", "updatedAt", "userAnswers" FROM "Proof";
DROP TABLE "Proof";
ALTER TABLE "new_Proof" RENAME TO "Proof";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
