# VoiceCart — AI Voice Shopping Assistant

> A fast, minimalist, voice-enabled grocery list manager with AI-driven natural language parsing, smart product suggestions, and real-time visual feedback.

![VoiceCart Screenshot](./public/screenshot.png)

---

## ✨ Features

- 🎙️ **Voice Commands** — Add, remove, search, and clear items by speaking naturally
- 🤖 **AI Parsing** — Groq LLM (llama-3.3-70b) extracts structured grocery data from any phrasing
- 🌍 **Multilingual** — English, Spanish, French, Hindi, and more
- 📦 **Smart Categorization** — Items auto-grouped by aisle (Produce, Dairy, Bakery, etc.)
- 💡 **Suggestions** — History-based, seasonal, and substitute product suggestions
- 🔍 **Voice Search** — Find products with constraints ("organic apples under $5")
- ⚡ **Optimistic UI** — Instant updates with server-sync and rollback
- 📱 **Mobile-first** — Works beautifully on all screen sizes

---

## 🛠 Local Setup

### Prerequisites

- Node.js 18+
- A [Groq API key](https://console.groq.com) (free) **or** OpenAI API key

### Installation

```bash
# 1. Clone / enter project
cd voice_command

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.local.example .env.local
# Edit .env.local and add your GROQ_API_KEY

# 4. Set up database
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Create SQLite database
npm run db:seed        # Seed with mock data

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes* | Groq API key for LLM parsing |
| `OPENAI_API_KEY` | Yes* | OpenAI fallback (if no Groq key) |
| `DATABASE_URL` | Yes | SQLite: `file:./dev.db` |

*At least one LLM API key is required.

---

## 🧪 Testing

```bash
# NLP parser tests (requires API key)
npm run test:parser

# Build check
npm run build

# Database UI
npm run db:studio
```

---

## 🏗 Architecture

**VoiceCart** is built as a full-stack Next.js 14 application using the App Router. The architecture separates concerns into three clear layers:

**Frontend layer** consists of React components with Zustand for client state and React Query for server synchronization. Voice input is captured via the native Web Speech API (zero cost, no third-party dependency), feeding live transcripts into the UI. Framer Motion provides layout animations and the audio HUD waveform.

**AI/NLP layer** receives raw transcripts via a POST `/api/parse-voice` route and sends them to Groq's `llama-3.3-70b-versatile` model with a strict JSON schema system prompt. Zod validates the structured output before it reaches the UI, with graceful fallback for malformed responses. OpenAI `gpt-4o-mini` is available as a secondary fallback.

**Data layer** uses Prisma ORM with SQLite (development) or PostgreSQL (production). Server Actions handle all mutations with optimistic updates that roll back on failure. The suggestions engine combines item purchase frequency, current season detection, and a curated substitution dictionary seeded into the database.

---

## 📁 Project Structure

```
app/
  api/
    parse-voice/    ← LLM transcript parsing
    suggestions/    ← Smart product suggestions
    search/         ← Product catalogue search
  layout.tsx        ← Root layout + providers
  page.tsx          ← Main dashboard
components/
  VoiceController   ← Mic button + command dispatch
  AudioHUD          ← Animated waveform / spinner
  ShoppingList      ← Category-grouped item list
  SuggestionsShelf  ← Horizontal suggestion carousel
  SearchDrawer      ← Slide-up search overlay
hooks/
  useVoiceRecognition  ← Web Speech API wrapper
  useShoppingList      ← React Query + server actions
  useSuggestions       ← Suggestion fetcher
lib/
  llm.ts           ← Groq/OpenAI client + retry
  parser.ts        ← Zod validation + category inference
  actions.ts       ← Server actions (CRUD)
  db.ts            ← Prisma singleton
store/
  shoppingStore    ← Zustand global state
prisma/
  schema.prisma    ← DB models
  seed.ts          ← 30+ history + 35 catalogue items
```

---

## 🎤 Voice Command Examples

| Say | Action |
|-----|--------|
| *"Add 2 cartons of almond milk"* | Adds 2 almond milks to Dairy |
| *"Put some sourdough and eggs on my list"* | Adds Bakery + Dairy items |
| *"Remove the water bottle"* | Removes water from list |
| *"Find organic apples under $5"* | Opens search with filter |
| *"Agrega dos litros de leche"* | Spanish: adds 2L milk |
| *"Clear my list"* | Clears all items |
| *"What do you suggest?"* | Shows suggestions panel |

---

## 📄 License

MIT
