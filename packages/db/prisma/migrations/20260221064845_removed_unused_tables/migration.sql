/*
  Warnings:

  - You are about to drop the `ErasePoint` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PathPoint` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Shape` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ErasePoint" DROP CONSTRAINT "ErasePoint_shapeId_fkey";

-- DropForeignKey
ALTER TABLE "PathPoint" DROP CONSTRAINT "PathPoint_shapeId_fkey";

-- DropForeignKey
ALTER TABLE "Shape" DROP CONSTRAINT "Shape_chatId_fkey";

-- DropTable
DROP TABLE "ErasePoint";

-- DropTable
DROP TABLE "PathPoint";

-- DropTable
DROP TABLE "Shape";
