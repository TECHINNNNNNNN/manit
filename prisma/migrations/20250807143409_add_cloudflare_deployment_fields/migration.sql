-- CreateEnum
CREATE TYPE "DeploymentStatus" AS ENUM ('PENDING', 'DEPLOYED', 'FAILED');

-- AlterTable
ALTER TABLE "Fragment" ADD COLUMN     "cloudflareProjectId" TEXT,
ADD COLUMN     "deploymentError" TEXT,
ADD COLUMN     "deploymentStatus" "DeploymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "deploymentUrl" TEXT;
