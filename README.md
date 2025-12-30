# Health Challenge App 🏃‍♂️💪

A modern Progressive Web App for tracking customizable health challenges with friends, family, or teams.

## ✨ Features

- **Customizable Challenges**: Create challenges of any duration (1 week, 75 days, custom)
- **Flexible Rules**: Add any rules you want (fasting, steps, no sugar, etc.)
- **Participant Management**: Add multiple people to each challenge
- **Progress Tracking**: Daily check-ins with streak tracking
- **PWA Support**: Install on your phone like a native app
- **Offline Mode**: Works without internet (coming soon)
- **Beautiful UI**: Modern glassmorphism design with smooth animations
- **Dark Mode**: Automatic dark/light mode support
- **Profile Pictures**: Choice of fitness icons or custom file uploads

## 🚀 Quick Start

### 1. Set Up Supabase

Follow the detailed guide in the artifacts: **[Supabase Setup Guide](./supabase-setup.md)**

Quick steps:
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Run the SQL schema from `supabase/schema.sql`
4. Copy your project URL and anon key

### 2. Configure Environment Variables

Create `.env.local` in the project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# App Password
APP_PASSWORD_HASH=your-hashed-password
```

**Generate password hash:**
```bash
node -e "console.log(require('crypto').createHash('sha256').update('your-password').digest('hex'))"
```

### 3. Install Dependencies

```bash
bun install
```

### 4. Run Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📱 Installing as PWA

### On iPhone/iPad:
1. Open the app in Safari
2. Tap the Share button
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

### On Android:
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Tap "Install app" or "Add to Home Screen"

## 🏗️ Project Structure

```
health-challenge/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── challenges/   # Challenge CRUD
│   │   ├── participants/ # Participant management
│   │   └── progress/     # Progress tracking
│   ├── types.ts          # TypeScript types
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # React components
│   └── LoginPage.tsx     # Login component
├── lib/
│   ├── supabase/         # Supabase clients
│   └── auth.ts           # Auth utilities
├── supabase/
│   └── schema.sql        # Database schema
└── public/               # Static assets
```

## 🎨 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + Custom CSS
- **Runtime**: Bun
- **TypeScript**: Full type safety
- **PWA**: Service Workers + Manifest

## 📝 Usage

### Creating a Challenge

1. Click "Create Challenge"
2. Enter challenge name and duration
3. Add rules (e.g., "No sugar", "10,000 steps", "16-hour fast")
4. Set start date
5. Click "Create"

### Adding Participants

1. Open a challenge
2. Click "Add Participant"
3. Enter name and optional email
4. Click "Add"

### Tracking Progress

1. Open a challenge
2. Select a participant
3. Check off completed rules for the day
4. View streaks and completion percentage

## 🔒 Security

- Passwords are hashed with SHA-256
- Session cookies are HTTP-only
- Supabase Row Level Security enabled
- Environment variables for sensitive data

## 🚧 Coming Soon

- [ ] Real-time updates (Supabase Realtime)
- [ ] Push notifications
- [ ] Leaderboards
- [ ] Challenge templates
- [ ] Export progress data
- [ ] Challenge sharing

## 📄 License

MIT

## 🤝 Contributing

This is a personal project, but feel free to fork and customize!

---

Built with ❤️ using Next.js and Supabase
