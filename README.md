# MotorsBazaar Voice Agent 🚗

A free AI-powered voice consultation agent for second-hand car buy/sell business.
- **Voice**: Hindi & Gujarati using browser Web Speech API (free)
- **AI Brain**: Groq (free tier — llama-3.3-70b)
- **Data Storage**: Google Sheets (free)
- **Dashboard**: React admin panel to manage all leads

---

## Quick Start

### Step 1 — Get a free Groq API key
1. Go to https://console.groq.com
2. Sign up (free)
3. Create an API key

---

### Step 2 — Set up Google Sheets API (one-time, ~10 minutes)

**a) Create Google Cloud project**
1. Go to https://console.cloud.google.com
2. Click "New Project" → name it `MotorsBazaar`
3. Enable **Google Sheets API**:
   - Search "Google Sheets API" → Enable
4. Enable **Google Drive API**:
   - Search "Google Drive API" → Enable

**b) Create Service Account**
1. Go to **IAM & Admin → Service Accounts**
2. Click "Create Service Account"
   - Name: `motorsbazaar-agent`
   - Click "Done"
3. Click on the created service account
4. Go to **Keys** tab → **Add Key** → **Create new key** → **JSON**
5. Download the JSON file
6. Rename it to `service-account.json`
7. Place it in: `backend/credentials/service-account.json`

**c) Create Google Sheet**
1. Go to https://sheets.google.com
2. Create a new spreadsheet
3. Name it exactly: `MotorsBazaar Consultations`
4. Copy the **service account email** from the JSON file (looks like: `motorsbazaar-agent@project.iam.gserviceaccount.com`)
5. Click **Share** on the Google Sheet → paste the service account email → give **Editor** access

---

### Step 3 — Run the Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Set up environment
copy .env.example .env
# Edit .env and fill in your GROQ_API_KEY

# Start the server
uvicorn app.main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

---

### Step 4 — Run the Frontend

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend runs at: http://localhost:5173

---

## Usage

### Voice Agent (Main Page)
- Open http://localhost:5173
- **Use Google Chrome** (required for voice features)
- Click **हिंदी** or **ગુજરાતી** to choose language
- Click the 🎤 mic button and speak
- Or type in the text box below
- "Priya" will collect your name, contact, and car query
- Data auto-saves to Google Sheets when consultation is complete

### Dashboard
- Open http://localhost:5173/dashboard
- View all consultations from Google Sheets
- Search by name, contact, or details
- Filter by status (New / In Progress / Done)
- Update status by clicking the dropdown
- Delete entries

---

## Project Structure

```
auto-consult-voice-agent/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app
│   │   ├── config.py            # Settings
│   │   ├── routers/
│   │   │   ├── chat.py          # POST /api/chat (Groq AI)
│   │   │   └── consultations.py # CRUD /api/consultations
│   │   ├── services/
│   │   │   ├── groq_service.py  # AI conversation
│   │   │   └── sheets_service.py# Google Sheets
│   │   ├── models/
│   │   │   ├── chat.py          # Chat schemas
│   │   │   └── consultation.py  # Consultation schemas
│   │   └── prompts/
│   │       ├── system_hindi.py  # Priya's Hindi persona
│   │       └── system_gujarati.py # Priya's Gujarati persona
│   ├── credentials/             # Place service-account.json here
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    └── src/
        ├── pages/
        │   ├── VoiceAgentPage.tsx  # Voice chat UI
        │   └── DashboardPage.tsx   # Admin dashboard
        ├── hooks/
        │   ├── useConversation.ts  # Chat state management
        │   ├── useSpeechRecognition.ts  # Mic input
        │   └── useSpeechSynthesis.ts    # Voice output
        └── components/
            ├── voice/              # Voice agent components
            └── dashboard/          # Dashboard components
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Voice not working | Use Google Chrome (Firefox/Safari not supported) |
| Microphone denied | Go to Chrome Settings → Privacy → Microphone → Allow |
| Gujarati voice unavailable | Normal — falls back to Hindi voice; text still in Gujarati |
| Google Sheets error | Check `credentials/service-account.json` path and Sheet sharing |
| Groq API error | Verify `GROQ_API_KEY` in `.env` file |
| CORS error | Make sure backend is running on port 8000 |

---

## Tech Stack (All Free)

| Component | Technology | Cost |
|-----------|-----------|------|
| AI / LLM | Groq (llama-3.3-70b) | Free tier |
| Voice Input | Browser Web Speech API | Free |
| Voice Output | Browser Speech Synthesis | Free |
| Backend | Python FastAPI | Free |
| Database | Google Sheets | Free |
| Frontend | React + Vite + Tailwind | Free |
