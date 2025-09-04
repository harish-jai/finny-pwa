# Finny PWA

A Progressive Web App for personal finance tracking built with React, TypeScript, and Supabase.

## Features

- 📱 **PWA Ready** - Installable app with offline capabilities
- 💰 **Expense Tracking** - Add, edit, and delete transactions
- 📊 **Insights & Analytics** - Visual charts and spending analysis
- 🔐 **Authentication** - Magic link sign-in with Supabase
- 🎨 **Modern UI** - Clean, responsive design without Tailwind

## Quick Start

### 1. Setup Environment

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```

### 2. Supabase Setup

1. Go to [Supabase](https://supabase.com) and create a new project
2. In Project Settings → API, copy the URL and anon key
3. Create the `expenses` table with the following schema:

```sql
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

-- Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access their own data
CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (auth.uid() = user_id);
```

4. Enable Email OTP / Magic Link in Authentication settings

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

### 5. Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable components
│   └── SignInBox.tsx   # Authentication widget
├── features/           # Feature-based modules
│   ├── expenses/       # Expense management
│   │   ├── api.ts      # Supabase API calls
│   │   ├── useExpenses.ts # React Query hooks
│   │   ├── ExpensesPage.tsx # Main page
│   │   ├── ExpenseForm.tsx # Add/edit form
│   │   └── ExpensesTable.tsx # Data table
│   └── insights/       # Analytics & charts
│       └── InsightsPage.tsx # Charts and KPIs
├── lib/               # Shared utilities
│   ├── supabase.ts    # Supabase client
│   ├── types.ts       # TypeScript types
│   └── date.ts        # Date utilities
├── App.tsx            # Main app component
├── main.tsx           # Entry point
├── routes.tsx         # Route definitions
└── App.css            # Global styles
```

## PWA Features

- **Manifest**: Configured for standalone display
- **Icons**: 192x192 and 512x512 PNG icons
- **Auto Update**: Service worker with auto-update capability
- **Installable**: Can be installed on mobile and desktop

## Authentication

The app uses Supabase's magic link authentication:

1. Enter your email in the sign-in form
2. Check your email for the magic link
3. Click the link to sign in automatically

For development, you can also sign in through the Supabase dashboard and the session will persist.

## Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **React Query** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Recharts** - Data visualization
- **Date-fns** - Date utilities
- **Supabase** - Backend as a Service
- **Vite PWA Plugin** - PWA capabilities

## Development Notes

- The app uses CSS custom properties for theming
- No external UI libraries - custom components only
- Responsive design with CSS Grid and Flexbox
- Type-safe API calls with TypeScript
- Optimistic updates with React Query

## Deployment

Build the project and deploy the `dist` folder to any static hosting service:

- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting

The PWA will work offline once installed and will auto-update when new versions are deployed.
