-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Signature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "signedAt" DATETIME,
    "email" TEXT,
    "token" TEXT,
    "comentario" TEXT,
    "motivoRechazo" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'PENDING',
    "calificacionGeneral" INTEGER,
    "calidadDesarrollo" INTEGER,
    "comunicacion" INTEGER,
    "cumplimientoTiempos" INTEGER,
    "recomendacion" INTEGER,
    "feedback" TEXT,
    CONSTRAINT "Signature_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Signature_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Signature" ("email", "id", "name", "projectId", "role", "signedAt", "token", "userId") SELECT "email", "id", "name", "projectId", "role", "signedAt", "token", "userId" FROM "Signature";
DROP TABLE "Signature";
ALTER TABLE "new_Signature" RENAME TO "Signature";
CREATE UNIQUE INDEX "Signature_token_key" ON "Signature"("token");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
