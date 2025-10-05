# ACEP - Advanced Clean Energy Planning

A modern SaaS prototype web application for remote industries to plan electricity needs using solar energy and storage systems instead of fuel generators.

## 🚀 Features

- **Modern UI/UX**: Clean, futuristic design with eco-tech theme
- **Authentication**: Secure login/register with Supabase
- **Dashboard**: User-friendly interface for energy planning
- **AI Assistant**: Integration ready for n8n webhook (ACEP Assistant)
- **Responsive Design**: Works on all devices
- **TypeScript**: Full type safety

## 🛠 Tech Stack

- **Framework**: Next.js 15.5.4
- **Styling**: Tailwind CSS 4
- **Database & Auth**: Supabase
- **Language**: TypeScript
- **Deployment**: Vercel ready

## 📦 Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   N8N_WEBHOOK_URL=https://n8n-elrsppnn.n8x.web.id/webhook/ccbda9d6-88aa-42fd-9de6-84710448761b
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎨 Design Theme

- **Colors**: Green (#4ADE80) and blue-gray (#0F172A) tones
- **Style**: Clean, modern, eco-energy focused
- **Components**: Rounded corners, soft shadows, glass morphism effects

## 📄 Pages

- **`/`** - Landing page with hero section and benefits
- **`/login`** - User authentication
- **`/register`** - User registration
- **`/dashboard`** - Main dashboard with ACEP Assistant

## 🔧 API Routes

- **`/api/chat`** - Handles messages to ACEP Assistant via n8n webhook

## 🚀 Deployment

The app is ready for deployment on Vercel:

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `N8N_WEBHOOK_URL` | n8n webhook for ACEP Assistant | Yes |

## 🎯 Future Enhancements

- Energy analytics dashboard
- Storage planning tools
- Solar optimization features
- Real-time monitoring
- Cost analysis tools

## 📄 License

© 2025 ACEP. All rights reserved.