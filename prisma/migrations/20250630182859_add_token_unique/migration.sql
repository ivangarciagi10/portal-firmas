/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `Signature` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Signature_token_key" ON "Signature"("token");
