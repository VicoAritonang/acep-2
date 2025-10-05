# 🚀 ACEP Deployment Guide for Vercel

## Prerequisites
- GitHub repository: https://github.com/VicoAritonang/acep.git
- Vercel account
- Supabase project with database setup

## Step 1: Prepare Your Supabase Project

1. **Create a Supabase project** at https://supabase.com
2. **Get your project credentials:**
   - Project URL
   - Anon/public key
3. **Set up your database** using the SQL files in your project:
   - `supabase-migration.sql`
   - `supabase-migration-complete.sql`
   - `schedule-table.sql`
   - `update-schedule-table.sql`

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "New Project"**
3. **Import from GitHub:**
   - Repository: `VicoAritonang/acep`
   - Framework: Next.js (auto-detected)
4. **Configure Environment Variables in Vercel Dashboard:**
   - Setelah project dibuat, klik pada project
   - Pergi ke tab "Settings" → "Environment Variables"
   - Tambahkan variables berikut:
   ```
   NEXT_PUBLIC_SUPABASE_URL = your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_anon_key
   N8N_WEBHOOK_URL = https://n8n-elrsppnn.n8x.web.id/webhook/ccbda9d6-88aa-42fd-9de6-84710448761b
   ```
5. **Redeploy** setelah menambahkan environment variables

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy from your project directory:**
   ```bash
   vercel
   ```

4. **Set environment variables:**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add N8N_WEBHOOK_URL
   ```

5. **Redeploy:**
   ```bash
   vercel --prod
   ```

## Step 3: Configure Supabase

### Database Setup
Run these SQL scripts in your Supabase SQL editor:

1. **Initial migration:** `supabase-migration.sql`
2. **Complete migration:** `supabase-migration-complete.sql`
3. **Schedule table:** `schedule-table.sql`
4. **Update schedule:** `update-schedule-table.sql`

### Row Level Security (RLS)
Ensure RLS is enabled on all tables:
- `users`
- `consumption_tools`
- `power_plants`
- `storage_units`
- `schedules`
- `chat_history`

## Step 4: Test Your Deployment

1. **Visit your Vercel URL**
2. **Test the demo login functionality**
3. **Verify all features work:**
   - User registration/login
   - Dashboard functionality
   - Consumption tools management
   - Calendar scheduling
   - Chatbot integration

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `N8N_WEBHOOK_URL` | n8n webhook URL for chatbot | `https://n8n-elrsppnn.n8x.web.id/webhook/ccbda9d6-88aa-42fd-9de6-84710448761b` |

## Troubleshooting

### Common Issues:

1. **Build Errors:**
   - Check Node.js version (18.x recommended)
   - Ensure all dependencies are installed

2. **Database Connection Issues:**
   - Verify Supabase credentials
   - Check RLS policies
   - Ensure tables exist

3. **Environment Variables:**
   - Double-check variable names
   - Ensure no trailing spaces
   - Redeploy after adding variables

### Support:
- Check Vercel logs in dashboard
- Review Supabase logs
- Test locally with production environment variables

## Production Optimizations

The project is already optimized for production with:
- ✅ Dark futuristic UI/UX
- ✅ Responsive design
- ✅ Performance optimizations
- ✅ Security best practices
- ✅ SEO-friendly structure

## Next Steps After Deployment

1. **Set up custom domain** (optional)
2. **Configure analytics** (optional)
3. **Set up monitoring** (optional)
4. **Configure backups** for Supabase

---

**Your ACEP application is now ready for production! 🎉**
