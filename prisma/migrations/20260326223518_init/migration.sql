-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "firm" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ein" TEXT,
    "industry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Filing" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "taxYear" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "method" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "qualAnswers" TEXT,
    "totalWages" DOUBLE PRECISION,
    "totalSupplies" DOUBLE PRECISION,
    "totalContracts" DOUBLE PRECISION,
    "totalQRE" DOUBLE PRECISION,
    "creditAmount" DOUBLE PRECISION,
    "ascPriorQRE1" DOUBLE PRECISION,
    "ascPriorQRE2" DOUBLE PRECISION,
    "ascPriorQRE3" DOUBLE PRECISION,

    CONSTRAINT "Filing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "filingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "w2Wages" DOUBLE PRECISION NOT NULL,
    "rdTimePct" DOUBLE PRECISION NOT NULL,
    "qualWages" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supply" (
    "id" TEXT NOT NULL,
    "filingId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Supply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "filingId" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "qualified" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Filing" ADD CONSTRAINT "Filing_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_filingId_fkey" FOREIGN KEY ("filingId") REFERENCES "Filing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supply" ADD CONSTRAINT "Supply_filingId_fkey" FOREIGN KEY ("filingId") REFERENCES "Filing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_filingId_fkey" FOREIGN KEY ("filingId") REFERENCES "Filing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
