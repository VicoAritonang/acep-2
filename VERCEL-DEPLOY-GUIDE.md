# 🚀 Panduan Deploy ACEP ke Vercel

## ❌ **Error yang Sering Terjadi:**
```
Environment Variable "NEXT_PUBLIC_SUPABASE_URL" references Secret "next_public_supabase_url", which does not exist.
```

## ✅ **Solusi: Deploy Tanpa vercel.json Environment Variables**

### **Langkah 1: Deploy Project**
1. **Buka [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Klik "New Project"**
3. **Import dari GitHub**: `VicoAritonang/acep`
4. **Klik "Deploy"** (tanpa environment variables dulu)

### **Langkah 2: Set Environment Variables**
1. **Setelah deploy selesai, klik pada project**
2. **Pergi ke tab "Settings"**
3. **Klik "Environment Variables"**
4. **Tambahkan variables satu per satu:**

   **Variable 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `your_supabase_project_url`
   - Environment: `Production, Preview, Development`

   **Variable 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `your_supabase_anon_key`
   - Environment: `Production, Preview, Development`

   **Variable 3:**
   - Name: `N8N_WEBHOOK_URL`
   - Value: `https://n8n-elrsppnn.n8x.web.id/webhook/ccbda9d6-88aa-42fd-9de6-84710448761b`
   - Environment: `Production, Preview, Development`

### **Langkah 3: Redeploy**
1. **Klik "Redeploy"** di tab "Deployments"
2. **Pilih deployment terbaru**
3. **Klik "Redeploy"**

## 🔧 **Alternatif: Deploy via Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add N8N_WEBHOOK_URL

# Deploy production
vercel --prod
```

## 📝 **Environment Variables yang Diperlukan:**

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase anon key |
| `N8N_WEBHOOK_URL` | `https://n8n-elrsppnn.n8x.web.id/webhook/ccbda9d6-88aa-42fd-9de6-84710448761b` | n8n webhook URL |

## ✅ **Cara Cek Environment Variables:**
1. **Buka project di Vercel Dashboard**
2. **Settings → Environment Variables**
3. **Pastikan semua 3 variables ada**
4. **Pastikan environment scope: Production, Preview, Development**

## 🚨 **Troubleshooting:**

### **Error: "Secret does not exist"**
- **Solusi**: Jangan set environment variables di `vercel.json`
- **Gunakan**: Vercel Dashboard → Settings → Environment Variables

### **Error: "Build failed"**
- **Solusi**: Pastikan semua environment variables sudah di-set
- **Redeploy** setelah menambahkan variables

### **Error: "n8n webhook not working"**
- **Solusi**: Pastikan `N8N_WEBHOOK_URL` sudah di-set dengan benar
- **Test**: Coba kirim pesan di chatbot

## 🎯 **Setelah Deploy Berhasil:**
1. **Test aplikasi** di URL Vercel
2. **Test login/register**
3. **Test chatbot** dengan n8n integration
4. **Test dashboard** functionality

---

**Deploy berhasil! 🎉**
