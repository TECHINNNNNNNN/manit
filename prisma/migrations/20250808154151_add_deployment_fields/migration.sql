/*
  Warnings:

  - A unique constraint covering the columns `[shortUrl]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "DeploymentStatus" AS ENUM ('PENDING', 'DEPLOYING', 'DEPLOYED', 'FAILED');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "deployedAt" TIMESTAMP(3),
ADD COLUMN     "deploymentStatus" "DeploymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "deploymentUrl" TEXT,
ADD COLUMN     "githubRepo" TEXT,
ADD COLUMN     "shortUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Project_shortUrl_key" ON "Project"("shortUrl");
