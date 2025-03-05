-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_QuizResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "mainTopic" TEXT NOT NULL,
    "subTopic" TEXT NOT NULL,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "incorrectCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "QuizResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_QuizResult" ("correctCount", "createdAt", "id", "incorrectCount", "mainTopic", "subTopic", "updatedAt", "userId") SELECT "correctCount", "createdAt", "id", "incorrectCount", "mainTopic", "subTopic", "updatedAt", "userId" FROM "QuizResult";
DROP TABLE "QuizResult";
ALTER TABLE "new_QuizResult" RENAME TO "QuizResult";
CREATE UNIQUE INDEX "QuizResult_userId_mainTopic_subTopic_key" ON "QuizResult"("userId", "mainTopic", "subTopic");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
