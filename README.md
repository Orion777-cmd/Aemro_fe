# Aemro (አምሮ) - Your AI Study Buddy

Aemro is your AI study buddy designed for students. Upload your textbooks and study materials, and Aemro will help you learn by directly referencing your preferred textbooks. Built with Next.js, React, TypeScript, and TailwindCSS.

## Features

- 📚 **Study Buddy**: AI assistant that helps you learn by referencing your textbooks
- 💬 **Real-time Chat**: Stream AI responses with a beautiful interface
- 📄 **Textbook Upload**: Upload PDF, TXT, or MD textbooks and study materials
- 🎯 **Direct References**: AI directly quotes and references your preferred textbooks
- 🎨 **Premium Design**: Black & gold theme with smooth animations
- 💾 **Persistent Storage**: Messages and textbooks saved in localStorage
- 📱 **Responsive**: Works seamlessly on desktop and mobile devices
- ✨ **Markdown Support**: Rich text rendering for AI responses

## Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **TailwindCSS**
- **Server Actions** for backend logic
- **react-markdown** for markdown rendering

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
BACKEND_API_URL=http://localhost:8000
```

**Note**: 
- Set `BACKEND_API_URL` to your LangGraph backend API URL
- If not set, defaults to `http://localhost:8000`
- If the backend is unreachable, the application will use mock responses for testing

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/
│   ├── actions/           # Server Actions
│   │   ├── chat.ts       # Chat completion logic
│   │   └── documents.ts  # Document upload/list logic
│   ├── components/        # React Components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── ChatWindow.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageItem.tsx
│   │   ├── ChatInput.tsx
│   │   └── DocumentPicker.tsx
│   ├── lib/              # Utilities
│   │   ├── utils.ts      # localStorage, formatting helpers
│   │   └── types.ts      # TypeScript types
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main page
├── uploads/              # Uploaded documents (created automatically)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Architecture

### Frontend

- **State Management**: React hooks (`useState`, `useEffect`) with localStorage persistence
- **Components**: Modular, reusable components following single responsibility principle
- **Styling**: TailwindCSS with custom black & gold theme
- **Streaming**: Server Actions with async generators for real-time response streaming

### Backend

- **Server Actions**: Next.js Server Actions for API logic
- **File Storage**: Local filesystem (`uploads/` directory)
- **Document Processing**: Supports PDF, TXT, and MD files
- **AI Integration**: LangGraph backend API with streaming support
- **Backend Communication**: RESTful API calls to LangGraph backend

### Data Flow

1. User sends a message → `ChatInput` component
2. Message added to state → `page.tsx`
3. Server Action called → `chat.ts` with selected document IDs
4. Documents loaded → `documents.ts` reads file contents
5. Context prepared → Combined with user message
6. AI API called → OpenAI API or mock response
7. Streamed response → Chunks yielded back to client
8. UI updates → Real-time message rendering

## Backend Configuration

### Backend API Setup

Configure your LangGraph backend URL in `.env.local`:

```env
BACKEND_API_URL=http://localhost:8000
```

**Backend API Requirements:**
- Endpoint: `POST /api/chat`
- Expected request format:
  ```json
  {
    "messages": [
      { "role": "user", "content": "..." },
      { "role": "assistant", "content": "..." }
    ],
    "document_ids": ["doc1", "doc2"],
    "stream": true
  }
  ```
- Response: Server-Sent Events (SSE) stream with text chunks
- The backend should handle document processing via LangGraph

The application will automatically:
- Connect to the backend if configured
- Fall back to mock responses if backend is unreachable
- Display appropriate error messages if connection fails

## Usage

1. **Upload Your Textbooks**: Click or drag your textbook files (PDF, TXT, MD) into the document picker
2. **Select Your Textbook**: Check the boxes next to the textbooks you want Aemro to reference
3. **Ask Questions**: Type questions about your course material and press Enter (or Shift+Enter for newline)
4. **Get Textbook-Based Answers**: Aemro will answer by directly referencing your selected textbooks
5. **Study Efficiently**: Use Aemro as your study buddy to understand concepts, get explanations, and review material
6. **Clear Chat**: Use the "Clear Chat" button to reset conversation history

## Code Quality

- ✅ Strong TypeScript typing throughout
- ✅ Reusable, modular components
- ✅ Clean folder structure
- ✅ No dead code or TODO placeholders
- ✅ Production-ready error handling
- ✅ Responsive design

## Bonus Features Implemented

- ✅ Drag & drop file upload
- ✅ Toast notifications (via browser alerts for errors)
- ✅ Dark scrollbar styling

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

Private project - All rights reserved.
# Aemro_fe
