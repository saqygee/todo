-- CreateTable
CREATE TABLE "Todo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueAt" DATETIME,
    "ordinal" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Todo_ordinal_key" ON "Todo"("ordinal");

-- CreateIndex
CREATE INDEX "Todo_deleted_completed_ordinal_idx" ON "Todo"("deleted", "completed", "ordinal");

-- CreateIndex
CREATE INDEX "Todo_deleted_ordinal_idx" ON "Todo"("deleted", "ordinal");

