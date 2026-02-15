<p align="center">
  <strong>MoneyMate</strong> — Master Your Money, Mate.
</p>

<p align="center">
  A modern, open-source personal finance tracker built with Next.js&nbsp;16, React&nbsp;19, and Drizzle&nbsp;ORM.<br/>
  Track expenses, set budgets, scan receipts with AI, and grow your wealth — all from your browser.
</p>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Expense Tracking** | Log income, expenses, and transfers with full categorisation |
| **Smart Budgeting** | Set monthly limits per category with visual progress bars |
| **Visual Insights** | Spending breakdown, trend analysis, and net-worth charts powered by Recharts |
| **Multiple Accounts** | Bank, e-wallet, cash, and investment accounts in one dashboard |
| **Savings Goals** | Create targets with progress tracking and visual milestones |
| **AI Receipt Scanner** | Snap a photo and let Google Gemma auto-extract transaction details |
| **Secure Auth** | Google OAuth via NextAuth v5 with SSL-encrypted data |
| **Multi-Currency(coming soon)** | Per-account currency with live exchange-rate conversion |

## 🛠 Tech Stack

- **Framework** — [Next.js 16](https://nextjs.org) (App Router, Server Components, Server Actions)
- **UI** — [React 19](https://react.dev), [Tailwind CSS v4](https://tailwindcss.com), [Lucide Icons](https://lucide.dev), [Radix UI](https://www.radix-ui.com), [Vaul](https://vaul.emilkowal.ski)
- **Database** — [Drizzle ORM](https://orm.drizzle.team) + [Turso / LibSQL](https://turso.tech)
- **Auth** — [NextAuth v5 (Auth.js)](https://authjs.dev) with Google provider
- **AI** — [Vercel AI SDK](https://sdk.vercel.ai) + Google Gemma for receipt scanning
- **Charts** — [Recharts](https://recharts.org)
- **Validation** — [Zod](https://zod.dev)

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** (or pnpm / yarn / bun)
- A **Turso** database (or any LibSQL-compatible DB)
- A **Google OAuth** client ID & secret ([console.cloud.google.com](https://console.cloud.google.com))
- *(Optional)* A **Google AI Studio API key** for receipt scanning

### Install

```bash
git clone https://github.com/bimadewantoro/moneymate-web.git
cd moneymate-web
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Database (Turso)
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...

# Auth.js
AUTH_SECRET=<random-secret>
AUTH_GOOGLE_ID=<google-client-id>
AUTH_GOOGLE_SECRET=<google-client-secret>

# AI Receipt Scanner (optional)
GOOGLE_GENERATIVE_AI_API_KEY=<your-key>
```

### Database Setup

```bash
npm run db:push        # push schema to local/dev DB
# npm run db:push:prod # push schema to production DB
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/          # Sign-in page
│   ├── (dashboard)/     # Dashboard, Budget, Transactions, Profile, Onboarding
│   └── (marketing)/     # Landing page
├── components/          # Shared UI components (Shadcn-style)
├── features/
│   ├── ai/              # AI receipt scanning action
│   ├── dashboard/       # Dashboard widgets (balance card, charts, stats)
│   ├── goals/           # Savings goals (create, add money, goal card)
│   ├── onboarding/      # First-run onboarding flow
│   ├── security/        # Security-related components
│   ├── settings/        # Account & category management
│   └── transactions/    # Transaction list, forms, context
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── server/
│   └── db/              # Drizzle schema, queries, mutations
└── types/               # Shared TypeScript types
```

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run Drizzle migrations |
| `npm run db:push` | Push schema directly (dev) |
| `npm run db:studio` | Open Drizzle Studio GUI |

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">Built with ❤️ for your financial wellness.</p>
