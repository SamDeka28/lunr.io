# Lunr - Link Infrastructure Platform

A complete link infrastructure platform built with Next.js and Supabase. URL shortening, QR codes, campaign management, and developer APIs. Build, track, and scale your link strategy.

![Status](https://img.shields.io/badge/status-active-success)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)

## ✨ Features

- 🚀 **Lightning Fast** - Generate short links instantly
- 🎨 **Beautiful UI** - Modern, responsive design with dark mode
- 📊 **Analytics** - Track clicks and performance (coming soon)
- 🔒 **Secure** - Built with security best practices
- 🎯 **Custom Codes** - Create memorable short codes
- ⚡ **Real-time** - Powered by Supabase real-time capabilities

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- A Supabase account and project

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up Supabase:**
   - Create a project in Supabase
   - Run the SQL schema from `supabase/schema.sql` in your Supabase SQL Editor

3. **Configure environment variables:**
```bash
cp .env.example .env
```

Fill in your Supabase credentials in `.env`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. **Start development server:**
```bash
npm run dev
```

Visit http://localhost:3000 to see your app!

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Detailed setup instructions
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete architecture overview
- **[MODULES.md](./MODULES.md)** - Module breakdown and dependencies
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Code organization

## 🏗️ Architecture

Built following a modular architecture with:

- **Configuration Module** - Centralized config management
- **URL Validation Module** - URL validation and normalization
- **Link Management Service** - Core business logic
- **Database Module** - Supabase repositories
- **API Routes** - Next.js API endpoints
- **Redirect Handler** - Smart redirect logic

## 📝 API Endpoints

- `POST /api/links` - Create a new short link
- `GET /api/links?short_code=xxx` - Get link details
- `GET /api/links/[id]` - Get link by ID
- `DELETE /api/links/[id]` - Delete a link
- `GET /[shortCode]` - Redirect to original URL

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## 🎯 Roadmap

### ✅ Phase 1: MVP (Completed)
- [x] Link shortening
- [x] Custom short codes
- [x] URL validation
- [x] Redirect handling
- [x] Beautiful UI

### 🚧 Phase 2: Enhanced Features
- [ ] Analytics dashboard
- [ ] Click tracking
- [ ] User authentication
- [ ] Link management dashboard

### 📋 Phase 3: Advanced Features
- [ ] QR code generation
- [ ] Custom domains
- [ ] Bulk link creation
- [ ] API rate limiting
- [ ] Link expiration notifications

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for your own purposes.

---

Built with ❤️ using Next.js and Supabase

