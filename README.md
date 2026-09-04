# Salam Global Opportunity Platform (SGOP)

A world-class EdTech ecosystem that bridges the gap between students (School to PhD) and global/local opportunities (Scholarships, Forums, Summer Schools, and Educational Consulting).

## 🚀 Features

- **Multi-language Support**: English, Russian, and Tajik with automatic language detection
- **Advanced Filtering**: Filter opportunities by level, country, funding type, and category
- **User Authentication**: NextAuth.js with Google, Apple ID, and Email/Password (with OTP)
- **Opportunity Discovery**: Smart search and filter system for finding the perfect opportunity
- **Responsive Design**: Mobile-first, modern UI with Framer Motion animations
- **Database**: PostgreSQL with Prisma ORM

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Prisma ORM
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL
- **Internationalization**: next-intl

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd SALAM
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- OAuth credentials (Google, Apple)
- Email SMTP settings
- OpenAI API key (for AI features)

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
SALAM/
├── app/
│   ├── [locale]/          # Internationalized routes
│   │   ├── layout.tsx     # Locale-specific layout
│   │   ├── page.tsx       # Home page
│   │   └── login/         # Authentication pages
│   ├── api/               # API routes
│   │   └── auth/          # NextAuth routes
│   └── globals.css        # Global styles
├── components/
│   ├── layout/            # Navbar, Footer
│   ├── home/              # Hero section
│   └── opportunities/     # Opportunity cards, filters
├── lib/
│   ├── auth.ts            # NextAuth configuration
│   └── prisma.ts          # Prisma client
├── messages/              # Translation files
│   ├── en.json
│   ├── ru.json
│   └── tj.json
├── prisma/
│   └── schema.prisma      # Database schema
└── types/                 # TypeScript type definitions
```

## 🎨 Design System

- **Primary Color**: Deep Navy (#001A33)
- **Accent Color**: Gold (#D4AF37)
- **Background**: White (#FFFFFF)
- **Design Language**: Modern Minimalism (Airbnb meets Apple)

## 🔐 Authentication

The platform supports multiple authentication methods:
- Email/Password with OTP verification
- Google OAuth
- Apple ID

## 🌍 Internationalization

The platform automatically detects user language based on:
1. Browser preferences (Accept-Language header)
2. IP geolocation (can be enhanced)
3. User preference (stored in database)

Supported languages:
- English (en)
- Russian (ru)
- Tajik (tj)

## 📊 Database Schema

Key models:
- **User**: User accounts with verification status
- **Program**: Educational opportunities (scholarships, forums, etc.)
- **Application**: User applications to programs
- **Event**: Online/offline events
- **EventBooking**: Event registrations with QR codes

## 🚧 Next Steps

1. Set up email service for OTP verification
2. Implement AI translation service
3. Add file upload functionality (CV, certificates)
4. Build admin dashboard
5. Implement application tracking system
6. Add event booking with QR code generation

## 📝 License

This project is private and proprietary.

