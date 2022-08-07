/*
  Warnings:

  - Made the column `text` on table `About` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "About" ADD COLUMN     "order" SERIAL NOT NULL,
ALTER COLUMN "text" SET NOT NULL;
