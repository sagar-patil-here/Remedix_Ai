# Remedix

> AI-powered prescription analyzer | Team: Runtime Rebels | GHR Hack 2025

---

## What is Remedix?

Remedix converts illegible handwritten prescriptions into clear, actionable health data.

Upload a prescription image or PDF and instantly get:

- Structured medicine list with dosage, frequency, and duration
- Cheaper generic alternatives with direct buy links
- Price comparison across Amazon Pharmacy, Tata 1mg, and PharmEasy
- Reminders synced to Google Calendar
- Summary pushed to your Telegram bot
- Audio playback in your local language (Text-to-Speech)
- Downloadable PDF report

---

## Features

| No. | Feature | Status |
|-----|---------|--------|
| 1 | AI Prescription Analysis (Gemini 2.0 Flash + HuggingFace) | Frontend Done |
| 2 | Price Comparison + Generic Alternative Suggestions | Frontend Done |
| 3 | Google Calendar Sync + Alarm Integration | Frontend Done |
| 4 | Dual AI Model (Gemini 2.0 Flash / Local HuggingFace) | Backend In Progress |
| 5 | Telegram Bot via n8n | Frontend Done |
| 6 | PDF Report Download | Frontend Done |
| 7 | Listen in My Language (Text-to-Speech) | Frontend Done |
| 8 | Save and Dashboard | Frontend Done |
| 9 | Landing Page | Done |
| 10 | Demo Mode with Dummy Data | Done |

---

## Tech Stack

### Frontend

| Tool | Purpose |
|------|---------|
| Next.js 14 (App Router) + TypeScript | Framework |
| Tailwind CSS + shadcn/ui (Radix UI) | Styling and components |
| Framer Motion | Animations |
| React useState / useCallback | Client-side state |

### Backend

| Tool | Purpose |
|------|---------|
| Node.js + Express + TypeScript | API server |
| Google Gemini 2.0 Flash | Prescription OCR and AI analysis |
| HuggingFace (local model) | Fallback AI model |
| n8n | Telegram bot automation |

->Still working on backend module and techstack could change according to need 

---

## Project Structure

```
RuntimeRebels/
|
+-- frontend/                        Next.js 14 application
|   +-- app/
|   |   +-- (landing)/               Landing page  ->  /
|   |   +-- upload/                  Upload + analysis  ->  /upload
|   |   +-- dashboard/               Saved analyses  ->  /dashboard
|   |   +-- result/[id]/             Full result view  ->  /result/:id
|   |   +-- api/
|   |       +-- analyze/             POST /api/analyze  (mock -> real backend)
|   |       +-- prescriptions/[id]/  GET  /api/prescriptions/:id
|   |
|   +-- components/
|   |   +-- UploadCard.tsx           Drag-and-drop file upload UI
|   |   +-- AnalysisDashboard.tsx    Full result: medicines, prices, actions
|   |   +-- HeroSection.tsx          Landing hero section
|   |   +-- Navbar.tsx               Top navigation bar
|   |   +-- ui/                      shadcn/ui base components
|   |
|   +-- lib/
|       +-- types.ts                 Shared TypeScript interfaces (contract with backend)
|       +-- mock-data.ts             All dummy data -- replace with real API calls
|       +-- api/client.ts            Frontend API client
|
+-- backend/                         Express + TypeScript server
    +-- src/
    |   +-- server.ts                Entry point (in progress)
    +-- package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm

---

### 1. Run the Frontend (Demo Mode)

```bash
cd RuntimeRebels/frontend
npm install
npm run dev
```

Open http://localhost:3000

Demo mode is fully functional. No backend or API keys are required.
Click "Try with sample data" on the Upload page to explore all features instantly.

---

### 2. Run the Backend (In Progress)

```bash
cd RuntimeRebels/backend
npm install
npm run dev
```

Server starts at http://localhost:4000

---

## Environment Variables

Create `RuntimeRebels/frontend/.env.local`:

```
# Backend URL (required once backend is live)
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Landing | / | Hero section, feature overview, how-it-works |
| Upload | /upload | Upload a prescription or load sample data |
| Result | /result/[id] | Full analysis: medicines, prices, reminders, actions |
| Dashboard | /dashboard | All saved prescription analyses |

---

## Backend Integration Guide

All dummy data lives in `frontend/lib/mock-data.ts`.
When the backend is ready, replace the following files:

| File | Current Behaviour | Replace With |
|------|------------------|--------------|
| app/api/analyze/route.ts | Calls createMockAnalysis() | Forward POST to backend /api/analyze |
| app/api/prescriptions/[id]/route.ts | Reads from in-memory store | Forward GET to backend /api/prescriptions/:id |
| lib/api/client.ts | Calls local Next.js API routes | Call the backend URL directly |

The `PrescriptionResult` type in `lib/types.ts` is the shared contract between frontend and backend.
The backend response must match this shape.

---

## License

MIT -- Built for GHR Hack 2025 by Team Runtime Rebels.
