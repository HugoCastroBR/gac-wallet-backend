-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "reversed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "accountValueBrl" SET DEFAULT 0;
