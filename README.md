# 💰 Daily Dough

> **Your daily discretionary spending, simplified.**  
> Stop wondering where your money went – know exactly how much fun money you have, every single day.

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-000000?style=flat&logo=next.js)](https://nextjs.org/)
[![React Native](https://img.shields.io/badge/Mobile-React%20Native-61DAFB?style=flat&logo=react)](https://reactnative.dev/)
[![Powered by Plaid](https://img.shields.io/badge/Powered%20by-Plaid-00D4AA?style=flat)](https://plaid.com/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat&logo=vercel)](https://vercel.com/)

---

## 🤔 The Problem

Ever feel like your money just... _disappears_?

- 💸 "I swear I had more money yesterday"
- 🤷‍♀️ "Can I afford this coffee or not?"
- 📱 "Let me check 3 different apps to figure out my budget"
- 😰 "Did I already spend my fun money this week?"

**Daily Dough fixes this.** One number. Every day. That's it.

---

## ✨ The Solution

### 🎯 **Your Daily Dial**

See exactly how much discretionary money you have **right now**, displayed as a beautiful daily allowance.

### 🔥 **Streak System**

Build momentum by staying under budget. Watch your streak grow and feel good about your financial discipline.

### 💧 **Slush Fund**

Unspent money rolls into your slush fund – perfect for those bigger purchases or unexpected treats.

### 🏦 **Smart Categorization**

- **Bills** (rent, utilities, subscriptions) – automatically excluded
- **Ignored** (work lunches, medical) – your choice
- **Everything else** – this is your discretionary spending

---

## 🏗️ Project Structure

```
Daily-Dough/
├── 📱 daily-dough-native/     # React Native mobile app
├── 🌐 daily-dough-api/       # Next.js backend API
└── 🎨 Figma Originals/       # Design system & components
```

### 📱 **Mobile App** (`daily-dough-native/`)

- Built with **React Native** & **Expo**
- Beautiful, intuitive interface designed in Figma
- Real-time transaction syncing
- Streak tracking and celebrations

### 🌐 **Backend API** (`daily-dough-api/`)

- **Next.js** API with TypeScript
- **Plaid** integration for bank connectivity
- **Vercel Postgres** for data storage
- Encrypted token storage with AES-256-GCM

### 🎨 **Design System** (`Figma Originals/`)

- Complete UI component library
- Consistent design tokens
- Ready-to-implement React components

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18.18.0+
- npm or yarn
- Plaid developer account
- Vercel account (for database)

### 1. Clone & Install

```bash
git clone https://github.com/slooops/Daily-Dough.git
cd Daily-Dough

# Install API dependencies
cd daily-dough-api && npm install

# Install mobile app dependencies
cd ../daily-dough-native && npm install
```

### 2. Set Up Backend

```bash
cd daily-dough-api

# Link to Vercel and pull environment variables
vercel link
vercel env pull .env.development.local

# Add your Plaid credentials to .env.development.local
# PLAID_CLIENT_ID=your_client_id
# PLAID_SECRET=your_secret

# Start the API server
npm run dev
```

### 3. Set Up Database

Create your table in the Neon SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS user_items (
  user_id TEXT PRIMARY KEY,
  access_token_enc TEXT NOT NULL,
  institution_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Run Mobile App

```bash
cd daily-dough-native
npx expo start
```

---

## 🛠️ Tech Stack

### Frontend

- **React Native** - Cross-platform mobile development
- **Expo** - Development toolchain and runtime
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Utility-first styling

### Backend

- **Next.js 15** - Full-stack React framework
- **Vercel** - Hosting and database
- **Plaid API** - Bank account connectivity
- **PostgreSQL** - Reliable data storage

### Security

- **AES-256-GCM** encryption for sensitive tokens
- **Environment variable** management
- **Server-side** token storage only

---

## 📱 Screenshots

_Coming soon! App is currently in development._

---

## 🎯 Roadmap

- [x] ✅ **Core API** - Vercel integration, transaction fetching
- [x] ✅ **Database Setup** - User data storage
- [ ] 🚧 **Mobile App** - React Native UI implementation
- [ ] 📊 **Transaction Categorization** - Bills & ignored rules
- [ ] 🔄 **Real-time Sync** - Webhook implementation
- [ ] 🎉 **Celebrations** - End-of-period animations
- [ ] 📈 **Analytics** - Spending insights and trends
- [ ] 🔒 **User Auth** - Multi-user support

---

## 🤝 Contributing

This is currently a personal project, but feel free to:

- 🐛 **Report bugs** via GitHub issues
- 💡 **Suggest features** you'd love to see
- ⭐ **Star the repo** if you find it interesting!

---

## 📄 License and Copyright

Idk enough about licensing and legal to decide if this is fully open or closed source
or should be GNU General Public License v3.0 or MIT. For now, the below applies.

**Copyright © 2025 Jacob Sloop. All Rights Reserved.**

---

## 🙏 Acknowledgments

- **Plaid** for making financial data accessible
- **Vercel** for seamless deployment and database hosting
- **Figma** for the incredible design tools
- **Claude** for development assistance

---

<div align="center">

**💰 Take control of your daily spending. One day at a time.**

[⭐ Star this repo](https://github.com/slooops/Daily-Dough) • [📱 Follow development](https://github.com/slooops/Daily-Dough/issues) • [🐛 Report bugs](https://github.com/slooops/Daily-Dough/issues/new)

</div>
