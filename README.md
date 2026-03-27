# CreditIQ — R&D Tax Credit Platform

A professional, guided platform for CPAs to prepare R&D tax credit studies under IRC § 41. Step-by-step interview flow → automatic RRC/ASC calculation → Form 6765 output.

**Live:** [rd-credit-production.up.railway.app](https://rd-credit-production.up.railway.app)

---

## What it does

CPAs log in, add clients, and run through a 6-step wizard for each tax year filing:

1. **Qualification** — 6 yes/no questions encode the 4-part test (permitted purpose, technological in nature, elimination of uncertainty, process of experimentation) plus funded research and internal-use software exclusions. Blocks progress if the activity doesn't qualify.
2. **Employees** — W-2 wages + R&D time % per person. Qualified wages calculated automatically.
3. **Supplies** — Materials and consumables used in qualified research (IRC § 41(b)(2)(C)).
4. **Contract Research** — Third-party vendor payments. 65% rule (IRC § 41(b)(3)) applied automatically.
5. **Calculate** — Gross receipts + prior 3yr QREs entered. App runs both RRC (20%) and ASC (14%) and picks the better method.
6. **Report** — Form 6765 line-by-line summary with full QRE breakdown tables, print-ready.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL via Prisma 5
- **Auth:** NextAuth.js (credentials provider)
- **Styling:** Tailwind CSS — dark theme
- **Deployment:** Railway

---

## Project Structure

```
rd-credit/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth handler
│   │   ├── register/             # CPA signup
│   │   ├── clients/              # Client CRUD
│   │   └── filings/              # Filing CRUD + credit calculation
│   ├── login/
│   ├── signup/
│   ├── dashboard/
│   └── clients/[id]/filings/[filingId]/
│       ├── page.tsx              # 6-step wizard
│       └── report/page.tsx       # Form 6765 output
├── components/
│   ├── AppShell.tsx              # Sidebar + layout
│   └── Providers.tsx             # SessionProvider
├── lib/
│   ├── auth.ts                   # NextAuth config
│   ├── calc.ts                   # RRC + ASC calculator (IRC § 41)
│   └── prisma.ts                 # Prisma client singleton
└── prisma/
    └── schema.prisma             # User, Client, Filing, Employee, Supply, Contract
```

---

## Getting Started Locally

### 1. Clone & install
```bash
git clone https://github.com/ryantimo/rd-credit.git
cd rd-credit
npm install
```

### 2. Set up environment
```bash
cp .env.example .env
# Fill in DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
```

### 3. Push schema to database
```bash
npx prisma db push
```

### 4. Start dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to Railway

1. Create a new Railway project
2. Add a PostgreSQL database service
3. Deploy this repo as a service
4. Set environment variables:
   - `DATABASE_URL` — reference the Postgres service variable
   - `NEXTAUTH_SECRET` — any random 32+ char string
   - `NEXTAUTH_URL` — your Railway app URL
   - `NIXPACKS_BUILD_CMD` — `npx prisma generate && npm run build`
5. Set start command: `npx prisma db push --accept-data-loss && npm start`

---

## Tax Credit Logic

All calculation logic lives in `lib/calc.ts`:

**Regular Research Credit (RRC)** — IRC § 41(a)(1)
- Credit = 20% × (Current QRE − Base Amount)
- Base Amount = Fixed-base % × avg gross receipts, minimum 50% of current QRE

**Alternative Simplified Credit (ASC)** — IRC § 41(c)(5)
- Credit = 14% × (Current QRE − 50% of avg prior 3yr QRE)
- If no prior QRE history: 6% × current QRE

The app calculates both methods and selects whichever produces the higher credit.

**QRE components:**
- Wages: W-2 wages × R&D time allocation % — IRC § 41(b)(2)(A)
- Supplies: consumables used in research — IRC § 41(b)(2)(C)
- Contract research: 65% of payments to third-party researchers — IRC § 41(b)(3)

---

## License

MIT
