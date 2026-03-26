-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "firm" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ein" TEXT,
    "industry" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Filing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "taxYear" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "method" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "qualAnswers" TEXT,
    "totalWages" REAL,
    "totalSupplies" REAL,
    "totalContracts" REAL,
    "totalQRE" REAL,
    "creditAmount" REAL,
    "ascPriorQRE1" REAL,
    "ascPriorQRE2" REAL,
    "ascPriorQRE3" REAL,
    CONSTRAINT "Filing_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "w2Wages" REAL NOT NULL,
    "rdTimePct" REAL NOT NULL,
    "qualWages" REAL NOT NULL,
    CONSTRAINT "Employee_filingId_fkey" FOREIGN KEY ("filingId") REFERENCES "Filing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Supply" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filingId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    CONSTRAINT "Supply_filingId_fkey" FOREIGN KEY ("filingId") REFERENCES "Filing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filingId" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "qualified" REAL NOT NULL,
    CONSTRAINT "Contract_filingId_fkey" FOREIGN KEY ("filingId") REFERENCES "Filing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
