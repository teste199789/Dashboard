/*
  Warnings:

  - You are about to drop the column `simulacaoDesvioPadrao` on the `Proof` table. All the data in the column will be lost.
  - You are about to drop the column `simulacaoMedia` on the `Proof` table. All the data in the column will be lost.
  - You are about to drop the column `simulacaoNotaDeCorte` on the `Proof` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "RankingSimulation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nomeCenario" TEXT NOT NULL,
    "notaUsuario" REAL NOT NULL,
    "notaCorte" REAL NOT NULL,
    "desvioPadrao" REAL NOT NULL,
    "totalInscritos" INTEGER NOT NULL,
    "posicaoEstimada" INTEGER NOT NULL,
    "proofId" INTEGER NOT NULL,
    CONSTRAINT "RankingSimulation_proofId_fkey" FOREIGN KEY ("proofId") REFERENCES "Proof" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Proof" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
    "orgao" TEXT,
    "cargo" TEXT,
    "notaDiscursiva" REAL,
    "resultadoObjetiva" TEXT,
    "resultadoDiscursiva" TEXT,
    "resultadoFinal" TEXT
);
INSERT INTO "new_Proof" ("aproveitamento", "banca", "cargo", "createdAt", "data", "gabaritoDefinitivo", "gabaritoPreliminar", "id", "inscritos", "notaDiscursiva", "orgao", "resultadoDiscursiva", "resultadoFinal", "resultadoObjetiva", "simulacaoAnuladas", "tipoPontuacao", "titulo", "totalQuestoes", "type", "userAnswers") SELECT "aproveitamento", "banca", "cargo", "createdAt", "data", "gabaritoDefinitivo", "gabaritoPreliminar", "id", "inscritos", "notaDiscursiva", "orgao", "resultadoDiscursiva", "resultadoFinal", "resultadoObjetiva", "simulacaoAnuladas", "tipoPontuacao", "titulo", "totalQuestoes", "type", "userAnswers" FROM "Proof";
DROP TABLE "Proof";
ALTER TABLE "new_Proof" RENAME TO "Proof";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
