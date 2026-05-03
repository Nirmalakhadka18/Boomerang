# 🪃 Boomerang — Found Hope Hub

> *Lost in the Ocean, Found at the Sea*

Boomerang is a digital lost & found platform that helps people recover their lost belongings. Just like a boomerang returns when thrown, lost items can find their way back to their rightful owners.

## 🔗 Live Demo

**[https://boomerang-wlaa.onrender.com](https://boomerang-wlaa.onrender.com)**

---

## ✨ Features

- 📋 **Report Lost Items** — Post details, photos, and location of lost belongings
- 📍 **Report Found Items** — Let others know you've found something
- 🔍 **Browse & Search** — Filter items by category, location, and date
- 💬 **Real-time Chat** — Securely message other users to reclaim belongings
- 🔐 **Authentication** — Sign up / login with email and password
- 📊 **Dashboard** — Manage all your reported items in one place

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React 18 + TypeScript | Frontend framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| shadcn/ui + Radix UI | UI components |
| Supabase | Backend, Auth & Database |
| React Router v6 | Client-side routing |
| TanStack Query | Server state management |
| React Hook Form + Zod | Form validation |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/Nirmalakhadka18/Boomerang.git
cd Boomerang

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your Supabase credentials in .env

# Start the development server
npm run dev
```

App will be running at `http://localhost:5173`

---

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
```

Get these from your [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API.

---

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/            # Route-level page components
│   ├── Index.tsx     # Home page
│   ├── Auth.tsx      # Login / Sign up
│   ├── Browse.tsx    # Search & browse items
│   ├── ReportLost.tsx
│   ├── ReportFound.tsx
│   ├── Dashboard.tsx
│   ├── ItemDetail.tsx
│   ├── Chat.tsx
│   └── Conversations.tsx
├── integrations/
│   └── supabase/     # Supabase client & types
├── hooks/            # Custom React hooks
└── lib/              # Utility functions
```

---

## 📦 Deployment

This project is deployed on **Render** as a Static Site.

```bash
# Build for production
npm run build
# Output is in the /dist folder
```

**Render Settings:**
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`

---

## 📄 License

MIT License © 2025 Boomerang
