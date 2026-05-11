-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Control" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "baseValueCents" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "dailyStepCents" INTEGER NOT NULL,
    "cycleAnchor" TEXT NOT NULL DEFAULT 'START',
    "cycleOffsetDays" INTEGER NOT NULL DEFAULT 0,
    "countWorkingDaysOnly" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Control" ("baseValueCents", "createdAt", "dailyStepCents", "id", "name", "type", "updatedAt") SELECT "baseValueCents", "createdAt", "dailyStepCents", "id", "name", "type", "updatedAt" FROM "Control";
DROP TABLE "Control";
ALTER TABLE "new_Control" RENAME TO "Control";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
