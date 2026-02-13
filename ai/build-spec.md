# Project: Lux Chat – AI Conversation Interface

You are a senior full-stack engineer.

Your job is to build a production-ready application, not a demo.
Write clean, scalable, maintainable code.

If a decision is unclear, choose the most industry-standard approach.

---

## 1. Objective

Build a ChatGPT-style interface where users can chat with an AI assistant.

The assistant must be able to use **user-selected documents** as context.

The UI must feel like a premium SaaS product using a **black & gold** theme.

---

## 2. Tech Stack (Strict)

- Next.js (latest, App Router)
- React
- TypeScript
- TailwindCSS
- Server Actions or API routes

Avoid heavy UI libraries unless absolutely necessary.

---

## 3. Functional Requirements

### 3.1 Chat
- Display conversation history
- User → right
- Assistant → left
- Streaming responses
- Input fixed at bottom
- Enter = send
- Shift+Enter = newline
- Show thinking/loading state
- Auto scroll

### 3.2 Documents
Users must be able to:

- Upload files (pdf, txt, md)
- View uploaded files
- Select/deselect files
- Selected files are sent as context to the backend

### 3.3 Backend
Provide logic for:

- chat completion
- upload document
- list documents

If LLM API key is missing → mock responses.

Architecture must allow easy OpenAI integration.

---

## 4. State Management

Store:
- messages
- active documents

Provide:
- clear chat button

Bonus:
- persist in localStorage

---

## 5. UI / UX Requirements

Style:
- black background
- gold accent
- elegant, minimal

Include:
- hover effects
- subtle borders
- smooth animations
- markdown rendering
- responsive mobile design

---

## 6. Required Components

Minimum:

- ChatWindow
- MessageList
- MessageItem
- ChatInput
- DocumentPicker
- Sidebar
- Header

---

## 7. Code Quality Rules

Must include:
- strong typing
- reusable components
- clean folder structure
- no dead code
- no TODO placeholders

Project must run with:

npm install  
npm run dev

---

## 8. Deliverables

Output must include:

1. Folder structure
2. Full code for every file
3. Setup instructions
4. Where API keys go
5. Architecture explanation

Do not summarize.
Provide full implementation.

---

## 9. Bonus Features (Optional)

- Drag & drop upload
- Toast notifications
- Dark scrollbar
