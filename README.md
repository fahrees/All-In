# 💰 WealthWise — Wealth Wellness Hub

> A one-stop platform for investors to track their financial health across traditional, digital, and private assets — powered by AI insights.

Built for the **NTU NFC FinTech Innovators Hackathon 2026**.

---

## 🚀 Features

- 📊 **Unified Portfolio Tracking** — Manage traditional stocks, crypto, and private assets in one place
- 🤖 **AI-Powered Insights** — Get personalised diversification, liquidity, and opportunity recommendations
- 🔐 **Secure Authentication** — Email & password login via Better Auth
- ☁️ **Cloud Database** — Persistent storage with PostgreSQL on NeonDB

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + TailwindCSS |
| Backend | Node.js + Express |
| Database | PostgreSQL (NeonDB) |
| Auth | Better Auth |
| AI | OpenAI GPT-4o |

---

## ⚙️ Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18+
- [Git](https://git-scm.com/)
- A [NeonDB](https://neon.tech/) account (free tier works)
- An [OpenAI](https://platform.openai.com/) API key

---

## 📦 Installation

### 1. Clone the repository
```
gh repo clone fahrees/All-In
```
### 2. Install dependencies
```
npm install
```
### 3. Set up environment variables
Create a .env file in the root of the project:
```
DATABASE_URL=postgresql://your_user:your_password@your_host/your_db?sslmode=require
AI_INTEGRATIONS_OPENAI_API_KEY=sk-your-openai-api-key
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
BETTER_AUTH_SECRET=your-random-secret-string
```

### 4. Push the database schema
```
npm run db:push
```
### 5. Start the development server
```
npm run dev
```

```bash
