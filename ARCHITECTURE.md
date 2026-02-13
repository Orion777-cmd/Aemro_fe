# Architecture Documentation

## System Overview

Aemro (አምሮ) is a full-stack Next.js application that provides a ChatGPT-style interface with document context support. The application follows a modern React architecture with Server Actions for backend logic.

## Architecture Layers

### 1. Presentation Layer (Frontend)

**Location**: `app/components/`

- **Header.tsx**: Application header with branding and mobile menu toggle
- **Sidebar.tsx**: Document management sidebar with upload and selection
- **ChatWindow.tsx**: Main chat interface container
- **MessageList.tsx**: Scrollable message container with auto-scroll
- **MessageItem.tsx**: Individual message rendering with markdown support
- **ChatInput.tsx**: Message input with Enter/Shift+Enter handling
- **DocumentPicker.tsx**: File upload with drag & drop support

**State Management**:
- React hooks (`useState`, `useEffect`) for component state
- localStorage for persistence (messages and documents)
- No global state management library (kept simple per requirements)

### 2. Application Logic Layer

**Location**: `app/page.tsx`

- Main application component
- Orchestrates all components
- Manages global state (messages, documents, selections)
- Handles user interactions and delegates to Server Actions

### 3. Server Layer (Backend)

**Location**: `app/actions/`

**Server Actions** (Next.js Server Actions):
- **chat.ts**: Handles AI chat completion with streaming
  - Supports OpenAI API integration
  - Falls back to mock responses if API key missing
  - Processes document context
  - Returns async generator for streaming

- **documents.ts**: Document management
  - `uploadDocument`: Handles file uploads (PDF, TXT, MD)
  - `listDocuments`: Lists all uploaded documents
  - `getDocumentContent`: Reads document content for context
  - Stores files in `uploads/` directory

### 4. Data Layer

**Storage**:
- **Filesystem**: Document files stored in `uploads/` directory
- **localStorage**: Messages and document metadata cached client-side
- **Environment Variables**: API keys stored in `.env.local`

**Data Flow**:
1. User uploads document → Server Action saves to filesystem → Returns metadata → Saved to localStorage
2. User sends message → Server Action loads selected documents → Combines with message → Calls AI API → Streams response
3. Messages persisted to localStorage on each update

### 5. Utility Layer

**Location**: `app/lib/`

- **utils.ts**: Helper functions
  - localStorage operations
  - File size formatting
  - Date formatting
  - CSS class merging

- **types.ts**: TypeScript type definitions
  - `Message` interface
  - `Document` interface

## Data Flow Diagrams

### Message Sending Flow

```
User Input → ChatInput Component
  ↓
page.tsx (handleSendMessage)
  ↓
Add user message to state
  ↓
Call chatCompletion Server Action
  ↓
Load selected documents → getDocumentContent
  ↓
Combine context with messages
  ↓
OpenAI API (or mock) → Stream response
  ↓
Update assistant message in real-time
  ↓
Save to localStorage
```

### Document Upload Flow

```
User selects file → DocumentPicker
  ↓
Create FormData → uploadDocument Server Action
  ↓
Validate file type
  ↓
Save to uploads/ directory
  ↓
Return document metadata
  ↓
Update documents state
  ↓
Save to localStorage
```

## Technology Decisions

### Why Next.js App Router?
- Modern React Server Components architecture
- Built-in Server Actions (no API routes needed)
- Excellent TypeScript support
- Production-ready optimizations

### Why Server Actions?
- Type-safe server-side logic
- No need for separate API routes
- Automatic request/response handling
- Streaming support for real-time responses

### Why localStorage?
- Simple persistence without backend database
- Works offline
- Fast access
- Meets requirement for bonus feature

### Why react-markdown?
- Secure markdown rendering
- Supports GitHub Flavored Markdown (GFM)
- Customizable components
- No XSS vulnerabilities

## Security Considerations

1. **File Upload Validation**: Strict file type checking (PDF, TXT, MD only)
2. **API Key Security**: Stored in environment variables, never exposed to client
3. **Markdown Rendering**: Uses react-markdown to prevent XSS
4. **Path Traversal Prevention**: File names sanitized, stored in controlled directory

## Scalability Considerations

### Current Limitations
- File storage: Local filesystem (not suitable for production at scale)
- State: localStorage (limited to ~5-10MB)
- No user authentication
- No database

### Future Improvements
- Replace filesystem storage with cloud storage (S3, etc.)
- Add database for messages and documents
- Implement user authentication
- Add Redis for caching
- Implement rate limiting
- Add document indexing/search

## Performance Optimizations

1. **Streaming Responses**: Real-time updates without waiting for full response
2. **Lazy Loading**: Components loaded on demand
3. **localStorage Caching**: Reduces server requests
4. **TailwindCSS**: Minimal CSS footprint
5. **Next.js Optimizations**: Automatic code splitting, image optimization

## Error Handling

- Server Actions: Try-catch blocks with error messages
- File Operations: Graceful fallbacks
- API Calls: Mock responses when API unavailable
- User Feedback: Alert dialogs for critical errors

## Testing Strategy (Future)

- Unit tests for utility functions
- Integration tests for Server Actions
- E2E tests for user flows
- Component tests for UI interactions

## Deployment Considerations

1. **Environment Variables**: Set `OPENAI_API_KEY` in production
2. **File Storage**: Use cloud storage for uploads directory
3. **Build**: `npm run build` creates optimized production build
4. **Server**: Requires Node.js runtime (Vercel, Railway, etc.)

## File Structure

```
frontend/
├── app/
│   ├── actions/          # Server Actions (backend logic)
│   ├── components/       # React components
│   ├── lib/             # Utilities and types
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main page
├── uploads/             # Document storage
├── public/              # Static assets (if any)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## API Integration

### OpenAI API
- Endpoint: `https://api.openai.com/v1/chat/completions`
- Model: `gpt-4` (configurable)
- Streaming: Enabled for real-time responses
- Context: Documents prepended to system message

### Mock Mode
- Activated when `OPENAI_API_KEY` is not set
- Returns simulated streaming responses
- Useful for UI development and testing
