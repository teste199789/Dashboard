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
    "type" TEXT NOT NULL DEFAULT 'CONCURSO'
);
INSERT INTO "new_Proof" ("aproveitamento", "banca", "createdAt", "data", "gabaritoDefinitivo", "gabaritoPreliminar", "id", "inscritos", "simulacaoAnuladas", "tipoPontuacao", "titulo", "totalQuestoes", "userAnswers") SELECT "aproveitamento", "banca", "createdAt", "data", "gabaritoDefinitivo", "gabaritoPreliminar", "id", "inscritos", "simulacaoAnuladas", "tipoPontuacao", "titulo", "totalQuestoes", "userAnswers" FROM "Proof";
DROP TABLE "Proof";
ALTER TABLE "new_Proof" RENAME TO "Proof";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
