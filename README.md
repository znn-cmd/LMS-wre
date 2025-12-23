# WRE LMS Platform

Corporate Learning Management System built with Next.js 14, TypeScript, Prisma, and Supabase.

## 🚀 Features

- **Multi-role System**: Admin, Teacher, Team Lead, Student
- **Course Management**: Create, edit, and manage courses with modules and lessons
- **Test Builder**: Create tests with multiple question types
- **Progress Tracking**: Track student progress and completion
- **Time Tracking**: Monitor active learning time
- **Multi-language**: Full RU/EN support
- **Dark/Light Mode**: Theme switching
- **Analytics Dashboards**: Role-specific dashboards with metrics

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **i18n**: next-intl
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Vercel account (for deployment)

## 🔧 Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/znn-cmd/LMS-wre.git
   cd LMS-wre
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Database (Supabase PostgreSQL)
   DATABASE_URL="postgresql://postgres:password@db.project.supabase.co:5432/postgres?sslmode=require"

   # Next.js
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up database**
   - Run the SQL script in Supabase SQL Editor: `scripts/create-tables-safe.sql`
   - Or use Prisma: `npm run db:push`

5. **Generate Prisma Client**
   ```bash
   npm run db:generate
   ```

6. **Seed database (optional)**
   ```bash
   npm run db:seed
   ```

7. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment on Vercel

### Step 1: Push to GitHub

1. Initialize git (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Add remote and push:
   ```bash
   git remote add origin https://github.com/znn-cmd/LMS-wre.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy on Vercel

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository: `znn-cmd/LMS-wre`
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `prisma generate && next build`
   - **Output Directory**: `.next`

5. **Add Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL` (with SSL: `?sslmode=require`)
   - `NEXT_PUBLIC_APP_URL` (your Vercel URL after first deploy)

6. Click "Deploy"

### Step 3: Post-Deployment

1. After first deployment, update `NEXT_PUBLIC_APP_URL` with your Vercel URL
2. Redeploy to apply changes

## 📊 Demo Accounts

After seeding the database:
- **Admin**: admin@demo.com / demo123
- **Teacher**: teacher@demo.com / demo123
- **Team Lead**: teamlead@demo.com / demo123
- **Student**: student1@demo.com / demo123

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── [locale]/          # Internationalized routes
│   │   ├── admin/         # Admin pages
│   │   ├── teacher/       # Teacher pages
│   │   ├── student/       # Student pages
│   │   └── teamlead/      # Team Lead pages
│   └── api/               # API routes
├── components/            # React components
│   ├── layout/           # Layout components
│   └── ui/               # UI components (shadcn/ui)
├── lib/                   # Utility functions
├── prisma/                # Prisma schema
├── scripts/               # Utility scripts
└── messages/              # i18n translations
```

## 🔐 Security Notes

- Never commit `.env` files
- Use environment variables in Vercel
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret
- Use SSL for database connections

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed database with demo data
- `npm run db:studio` - Open Prisma Studio

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is proprietary software.

## 🆘 Support

For issues and questions, please open an issue on GitHub.
