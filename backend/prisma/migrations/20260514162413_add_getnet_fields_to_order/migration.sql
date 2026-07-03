-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "getnetProcessUrl" TEXT,
ADD COLUMN     "getnetRequestId" TEXT,
ADD COLUMN     "paymentPayload" JSONB,
ADD COLUMN     "paymentProvider" TEXT DEFAULT 'GETNET',
ADD COLUMN     "paymentStatus" TEXT DEFAULT 'PENDING',
ADD COLUMN     "reference" TEXT;
