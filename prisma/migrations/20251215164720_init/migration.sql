-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "pair" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "side" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "dex" TEXT,
    "txHash" TEXT,
    "price" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
