<div align="center">
  <div style="background: rgba(139, 92, 246, 0.1); padding: 20px; border-radius: 50%; display: inline-block; margin-bottom: 20px;">
    <img src="https://api.iconify.design/lucide/shopping-cart.svg?color=%238b5cf6&width=64" alt="VoiceCart Logo" />
  </div>
  
  # VoiceCart — AI Shopping Assistant

  **A modern, voice-powered grocery list manager built with Next.js, Groq, and Tailwind CSS.**
  <br />
  Say what you need, and AI organizes it for you.

  [![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
  [![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
  [![Groq](https://img.shields.io/badge/AI-Groq_Llama_3-f59e0b)](https://groq.com/)
</div>

<hr />

## ✨ Features

- 🎙️ **Natural Voice Commands**: Uses the Web Speech API and Llama 3 to understand complex, multi-item commands (e.g., *"Add 2 apples, some bread, and a gallon of milk"*).
- 🌍 **Multilingual**: Speak your list in English, Spanish, French, or Hindi—the AI translates and categorizes it automatically.
- 🎨 **Dark-Mode Glassmorphism UI**: Beautiful, fully responsive interface built with Tailwind CSS and animated with Framer Motion.
- 🧠 **Smart Parsing**: Automatically categorizes items into aisles (Produce, Dairy, Meat, etc.) and tracks quantities and units.
- 🔍 **AI Search & Suggestions**: Recommends seasonal items, frequent purchases, and allows complex querying (e.g., *"Find organic apples under $5"*).
- ⚡ **Optimistic Updates**: Snappy UI driven by React Query and Zustand state management.

---

## 🏗️ Architecture

VoiceCart utilizes a modern serverless architecture, bridging browser-native speech recognition with high-speed LLM processing via Groq.

```mermaid
graph TD
    %% Define Styles
    classDef client fill:#1e1e2f,stroke:#6366f1,stroke-width:2px,color:#fff
    classDef server fill:#1e1e2f,stroke:#10b981,stroke-width:2px,color:#fff
    classDef external fill:#1e1e2f,stroke:#f59e0b,stroke-width:2px,color:#fff
    classDef db fill:#1e1e2f,stroke:#3b82f6,stroke-width:2px,color:#fff

    subgraph Client [Frontend Application]
        UI[React UI Components]:::client
        Speech[Web Speech API]:::client
        State[Zustand & React Query]:::client
    end

    subgraph Backend [Next.js Serverless Edge]
        Parser[Voice Parser Route]:::server
        Actions[Server Actions]:::server
    end

    subgraph AI [External Intelligence]
        Groq[Groq API - Llama 3]:::external
    end

    subgraph Storage [Database Layer]
        Prisma[Prisma ORM]:::db
        SQLite[(SQLite Database)]:::db
    end

    %% Flow
    UI -- 1. Taps Mic --> Speech
    Speech -- 2. Transcribes Audio --> UI
    UI -- 3. POST /api/parse-voice --> Parser
    Parser -- 4. Strict Prompting --> Groq
    Groq -- 5. JSON Commands --> Parser
    Parser -- 6. Zod Validation --> Actions
    Actions -- 7. Execute Mutations --> Prisma
    Prisma <--> SQLite
    Actions -- 8. Return Updated State --> State
    State -- 9. Reactive Re-render --> UI
```

---

## 💻 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + custom Glassmorphism UI
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Database**: [SQLite](https://sqlite.org/) (Dev) / [Prisma ORM](https://www.prisma.io/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) + [TanStack React Query](https://tanstack.com/query/latest)
- **AI / LLM**: [Groq](https://groq.com/) (Llama 3 70B via Groq SDK)
- **Validation**: [Zod](https://zod.dev/)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/TusharSaxena2004/voice-cart.git
cd voice-cart
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory and add your Groq API key:
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
DATABASE_URL="file:./dev.db"
```
*(Get a free, ultra-fast API key from [console.groq.com](https://console.groq.com))*

### 4. Database Setup & Seeding
Initialize the SQLite database and populate it with sample catalogue data:
```bash
npx prisma db push
npx prisma generate
npm run seed
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗣️ Example Voice Commands

Tap the microphone icon (works best in Chrome or Edge) and try saying:

* **Basic Addition**: *"Add milk and two loaves of bread"*
* **Complex Quantities**: *"I need a gallon of water, 500 grams of pasta, and 3 cans of soda"*
* **Removal**: *"Remove the water"* or *"I don't need the pasta anymore"*
* **Searching**: *"Find me some organic apples under 5 dollars"*
* **Multilingual**: *"Agrega tres manzanas y jugo de naranja"*
* **Clearing**: *"Clear my shopping list"*

---

## 🧪 Running Tests

The NLP parser can be tested offline against the LLM to verify edge cases, formatting, and JSON schemas:

```bash
npm run test:parser
```

---
<div align="center">
  <sub>Built with ❤️ by AI for seamless everyday shopping.</sub>
</div>
