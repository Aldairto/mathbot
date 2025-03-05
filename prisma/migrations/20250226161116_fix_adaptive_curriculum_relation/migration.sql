-- CreateTable
CREATE TABLE "AdaptiveCurriculum" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdaptiveCurriculum_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mainTopic" TEXT NOT NULL,
    "subTopic" TEXT NOT NULL,
    "difficulty" REAL NOT NULL DEFAULT 0.5,
    "importance" REAL NOT NULL DEFAULT 0.5,
    "curriculumId" TEXT NOT NULL,
    CONSTRAINT "Topic_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "AdaptiveCurriculum" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AdaptiveCurriculum_userId_key" ON "AdaptiveCurriculum"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_curriculumId_mainTopic_subTopic_key" ON "Topic"("curriculumId", "mainTopic", "subTopic");
