# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Korean economics study website that sends a daily email digest of global economic news every morning at 8 AM KST. Built with Next.js 14 App Router, TypeScript, Tailwind CSS.

## Tech Stack
- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS 3
- **News source**: NewsAPI (`category=business&country=us`)
- **AI summarization**: Anthropic Claude (`claude-sonnet-4-6`) — Korean translation + term explanations
- **Email**: Resend
- **Deployment**: Vercel (cron job at `0 23 * * *` UTC = 8 AM KST)

## Project Structure
```
app/
  layout.tsx          # Root layout with Noto Sans KR font
  page.tsx            # Main page (server component, ISR revalidate=3600)
  globals.css
  api/send-digest/
    route.ts          # Cron endpoint (GET, protected with CRON_SECRET)
lib/
  news.ts             # fetchEconomicNews() → RawArticle[]
  claude.ts           # generateKoreanDigest() → KoreanDigest
  email.ts            # sendDigestEmail()
```

## Development
```bash
npm install
npm run dev
```

## Testing the Email Endpoint
```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/send-digest
```

## Deployment (Vercel)
1. Push to GitHub, import in Vercel
2. Add all environment variables in Vercel project settings
3. The cron job in `vercel.json` fires automatically at 23:00 UTC (08:00 KST)
