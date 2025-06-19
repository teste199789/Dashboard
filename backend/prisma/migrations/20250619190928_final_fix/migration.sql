/*
  Warnings:

  - You are about to drop the `RankingSimulation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to alter the column `resultadoDiscursiva` on the `Proof` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `resultadoFinal` on the `Proof` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - Added the required column `updatedAt` to the `Proof` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "RankingSimulation";
PRAGMA foreign_keys=on;

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
    "resultadoObjetiva" TEXT,
    "resultadoDiscursiva" JSONB,
    "resultadoFinal" JSONB
);
INSERT INTO "new_Proof" ("aproveitamento", "banca", "cargo", "createdAt", "updatedAt", "data", "gabaritoDefinitivo", "gabaritoPreliminar", "id", "inscritos", "notaDiscursiva", "orgao", "resultadoDiscursiva", "resultadoFinal", "resultadoObjetiva", "simulacaoAnuladas", "tipoPontuacao", "titulo", "totalQuestoes", "type", "userAnswers") SELECT "aproveitamento", "banca", "cargo", "createdAt", CURRENT_TIMESTAMP, "data", "gabaritoDefinitivo", "gabaritoPreliminar", "id", "inscritos", "notaDiscursiva", "orgao", "resultadoDiscursiva", "resultadoFinal", "resultadoObjetiva", "simulacaoAnuladas", "tipoPontuacao", "titulo", "totalQuestoes", "type", "userAnswers" FROM "Proof";
DROP TABLE "Proof";
ALTER TABLE "new_Proof" RENAME TO "Proof";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
