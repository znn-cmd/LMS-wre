# 🔐 Environment Variables for Vercel

Copy these variables to your Vercel project settings:

## Required Environment Variables

Add these in Vercel Dashboard → Project Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://cndmouefqjfmxgovrzbx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_AlCrI62hTdb9ZJ5Rr2X_fg_2NF7YpCr
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuZG1vdWVmcWpmbXhnb3ZyemJ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTg4ODgwNCwiZXhwIjoyMDgxNDY0ODA0fQ.KnUYKUEFZy_iraU4BBEIhRb0628tvrzRoF1N_2y9xmM
DATABASE_URL=postgresql://postgres.cndmouefqjfmxgovrzbx:Km13nn07!z*@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

## Important Notes

1. **NEXT_PUBLIC_APP_URL**: 
   - After first deployment, replace `your-project.vercel.app` with your actual Vercel URL
   - Example: `https://lms-wre.vercel.app`

2. **DATABASE_URL**: 
   - Use Connection Pooler URL (recommended for serverless)
   - Format: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-[REGION].pooler.supabase.com:5432/postgres?sslmode=require`
   - Or direct: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require`

3. **Security**:
   - Never commit these values to git
   - Keep `SUPABASE_SERVICE_ROLE_KEY` secret
   - Use Vercel's environment variables for all sensitive data

## How to Add in Vercel

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Environment Variables**
3. Click **Add New**
4. Enter variable name and value
5. Select environments (Production, Preview, Development)
6. Click **Save**
7. **Redeploy** your project for changes to take effect

## After First Deployment

1. Copy your Vercel deployment URL
2. Update `NEXT_PUBLIC_APP_URL` with the actual URL
3. Redeploy the project


