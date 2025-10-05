#!/bin/bash

# ACEP Vercel Deployment Script
echo "🚀 Starting ACEP deployment to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel first:"
    vercel login
fi

# Deploy to Vercel
echo "📦 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "📝 Don't forget to set your environment variables in Vercel dashboard:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - N8N_WEBHOOK_URL (already configured: https://n8n-elrsppnn.n8x.web.id/webhook/ccbda9d6-88aa-42fd-9de6-84710448761b)"
