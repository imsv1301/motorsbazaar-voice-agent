# MotorsBazaar Voice Agent

AI voice consultation agent for a second-hand car dealership. Speaks Hindi and Gujarati, collects buyer/seller leads through conversation, saves everything to Google Sheets.

Runs entirely on free tiers. No cloud costs.

---

## What it does

"Priya" — the AI agent — greets customers, asks about what they're looking to buy or sell, collects their name and contact number, and logs the full consultation to a Google Sheet. A React admin dashboard lets the dealership team view, filter, and update lead status.

Voice input and output both run in the browser (Web Speech API). Chrome only.

---

## Stack

| Component | Technology | Cost |
|-----------|-----------|------|
| AI / LLM | Groq (llama-3.3-70b) | Free tier |
| Voice input | Browser Web Speech API | Free |
| Voice output | Browser Speech Synthesis | Free |
| Backend | Python FastAPI | Free |
| Database | Google Sheets | Free |
| Frontend | React + Vite + Tailwind | Free |

---

## Setup

### Step 1 — Groq API key (2 minutes)

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (free)
3. Create an API key

### Step 2 — Google Sheets API (10 minutes)

**Create a Google Cloud project:**
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. New Project → name it `MotorsBazaar`
3. Enable Google Sheets API and Google Drive API

**Create a Service Account:**
1. IAM & Admin → Service Accounts → Create Service Account
2. Name: `motorsbazaar-agent` → Done
3. Click the account → Keys → Add Key → Create new key → JSON
4. Download the JSON, rename to `service-account.json`
5. Place at `backend/credentials/service-account.json`

**Set up the Google Sheet:**
1. Create a new spreadsheet at [sheets.google.com](https://sheets.google.com)
2. Name it exactly: `MotorsBazaar Consultations`
3. Copy the service account email from the JSON file
4. Share the sheet with that email → Editor access

### Step 3 — Run the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Mac/Linux
# venv\Scripts\activate        # Windows

pip install -r requirements.txt

cp .env.example .env
# Edit .env — add your GROQ_API_KEY

uvicorn app.main:app --reload --port 8000
```

Backend: http://localhost:8000 | API docs: http://localhost:8000/docs

### Step 4 — Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

---

## Using the agent

**Voice agent** — http://localhost:5173
- Open in Google Chrome (required for voice)
- Choose Hindi or Gujarati
- Click the mic and speak, or type below
- Priya collects name, contact, and car query
- Data saves to Google Sheets when consultation completes

**Admin dashboard** — http://localhost:5173/dashboard
- View all consultations pulled from Google Sheets
- Search by name, contact, or details
- Filter by status: New / In Progress / Done
- Update status inline, delete entries

---

## Project structure

```
motorsbazaar-voice-agent/
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI app
│   │   ├── config.py
│   │   ├── routers/
│   │   │   ├── chat.py                # POST /api/chat (Groq AI)
│   │   │   └── consultations.py       # CRUD /api/consultations
│   │   ├── services/
│   │   │   ├── groq_service.py
│   │   │   └── sheets_service.py
│   │   └── prompts/
│   │       ├── system_hindi.py        # Priya's Hindi persona
│   │       └── system_gujarati.py     # Priya's Gujarati persona
│   ├── credentials/                   # place service-account.json here
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    └── src/
        ├── pages/
        │   ├── VoiceAgentPage.tsx
        │   └── DashboardPage.tsx
        ├── hooks/
        │   ├── useConversation.ts
        │   ├── useSpeechRecognition.ts
        │   └── useSpeechSynthesis.ts
        └── components/
            ├── voice/
            └── dashboard/
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Voice not working | Use Google Chrome — Firefox and Safari don't support Web Speech API |
| Microphone denied | Chrome Settings → Privacy → Microphone → Allow localhost |
| Gujarati voice unavailable | Expected — falls back to Hindi voice, text stays in Gujarati |
| Google Sheets error | Check `credentials/service-account.json` path and sheet sharing permissions |
| Groq API error | Check `GROQ_API_KEY` in `.env` |
| CORS error | Make sure backend is running on port 8000 before starting frontend |

---

## Built by

**Mohammad Sahil Vahora** — ECE Final Year, Parul University 2026

GitHub: [@imsv1301](https://github.com/imsv1301)
