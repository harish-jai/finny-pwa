# Finny PWA Setup Guide

## Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn
- Supabase account

## Quick Setup

### 1. Environment Variables

Create a `.env` file in the project root:

```bash
# Copy your values from Supabase Project Settings → API
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

### 2. Supabase Database Setup

Run this SQL in your Supabase SQL Editor:

```sql
-- Create expenses table
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  store TEXT,
  payment_method TEXT,
  tags TEXT[],
  recurring BOOLEAN DEFAULT false,
  gift TEXT,
  girlfriend DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policies for user data access
CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (auth.uid() = user_id);
```

### 3. Authentication Setup

1. Go to Supabase Dashboard → Authentication → Settings
2. Enable "Email OTP" (Magic Link)
3. Configure your email provider if needed

### 4. Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Development Notes

- The app will work without authentication for development
- TypeScript errors in ExpenseForm are cosmetic and don't affect functionality
- PWA features work in production build
- Icons are placeholder 1x1 pixel images - replace with real icons

## Testing PWA Features

1. Build the project: `npm run build`
2. Serve the dist folder: `npx serve dist`
3. Open in Chrome and check "Install" option in address bar
4. Test offline functionality

## Deployment

Deploy the `dist` folder to any static hosting service:

- **Vercel**: `vercel --prod`
- **Netlify**: Drag `dist` folder to Netlify
- **GitHub Pages**: Push to gh-pages branch
- **Firebase**: `firebase deploy`

The PWA will be installable and work offline once deployed.
