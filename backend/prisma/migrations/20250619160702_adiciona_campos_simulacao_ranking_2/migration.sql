/*
  Warnings:

  - You are about to drop the column `desvioPadrao` on the `Proof` table. All the data in the column will be lost.
  - You are about to drop the column `notaCorteEstimada` on the `Proof` table. All the data in the column will be lost.

*/
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
    "simulacaoMedia" REAL,
    "simulacaoDesvioPadrao" REAL,
    "simulacaoNotaDeCorte" REAL,
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
