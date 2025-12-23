# 🚀 Deployment Guide for Vercel

## Prerequisites

1. GitHub account with repository: https://github.com/znn-cmd/LMS-wre.git
2. Vercel account (sign up at https://vercel.com)
3. Supabase project with database configured

## Step-by-Step Deployment

### 1. Prepare Your Repository

Make sure your code is pushed to GitHub:

```bash
# If not already done
git init
git add .
git commit -m "Initial commit - WRE LMS Platform"
git remote add origin https://github.com/znn-cmd/LMS-wre.git
git branch -M main
git push -u origin main
```

### 2. Deploy on Vercel

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com
   - Sign in with your GitHub account

2. **Import Project**
   - Click "Add New Project"
   - Select your repository: `znn-cmd/LMS-wre`
   - Click "Import"

3. **Configure Project Settings**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `prisma generate && next build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)
   - **Install Command**: `npm install` (auto-filled)

4. **Add Environment Variables**
   
   Click "Environment Variables" and add:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres?sslmode=require
   NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
   ```

   **Important**: 
   - Replace all placeholder values with your actual Supabase credentials
   - For `NEXT_PUBLIC_APP_URL`, use your Vercel deployment URL (you'll get it after first deploy)

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (usually 2-5 minutes)

### 3. Post-Deployment Configuration

1. **Get Your Vercel URL**
   - After deployment, you'll get a URL like: `https://lms-wre.vercel.app`
   - Copy this URL

2. **Update Environment Variables**
   - Go to Project Settings → Environment Variables
   - Update `NEXT_PUBLIC_APP_URL` with your actual Vercel URL
   - Redeploy the project

3. **Verify Database Connection**
   - Make sure your Supabase database is accessible from Vercel
   - Check that `DATABASE_URL` includes `?sslmode=require`

### 4. Database Setup on Supabase

1. **Run SQL Script**
   - Go to Supabase Dashboard → SQL Editor
   - Copy and paste contents of `scripts/create-tables-safe.sql`
   - Execute the script

2. **Seed Database (Optional)**
   - You can seed the database locally first, or
   - Use Supabase SQL Editor to insert demo data

### 5. Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `DATABASE_URL` | PostgreSQL connection string with SSL | Yes |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL | Yes |

## Troubleshooting

### Build Fails

1. **Prisma Generation Error**
   - Ensure `DATABASE_URL` is correctly set
   - Check that database is accessible

2. **TypeScript Errors**
   - Run `npm run lint` locally to check for errors
   - Fix all TypeScript errors before deploying

3. **Missing Dependencies**
   - Check `package.json` has all required dependencies
   - Ensure `postinstall` script runs `prisma generate`

### Runtime Errors

1. **Database Connection Issues**
   - Verify `DATABASE_URL` format
   - Check Supabase connection settings
   - Ensure SSL is enabled (`?sslmode=require`)

2. **Environment Variables Not Loading**
   - Restart deployment after adding variables
   - Check variable names match exactly
   - Ensure `NEXT_PUBLIC_*` variables are public

### Performance Issues

1. **Slow Build Times**
   - Enable Vercel Build Cache
   - Optimize Prisma queries
   - Use Edge Functions where possible

## Monitoring

- **Vercel Analytics**: Enable in project settings
- **Logs**: Check deployment logs in Vercel dashboard
- **Database**: Monitor Supabase dashboard for queries

## Updates and Redeployments

- Every push to `main` branch triggers automatic deployment
- For manual redeploy: Go to Deployments → Redeploy
- Environment variable changes require redeployment

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs


