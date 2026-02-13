# Project Folder Structure

```
frontend/
├── ai/
│   └── build-spec.md                    # Project specification
│
├── app/
│   ├── actions/                         # Server Actions (Backend Logic)
│   │   ├── chat.ts                     # Chat completion with streaming
│   │   └── documents.ts                # Document upload/list operations
│   │
│   ├── components/                      # React Components
│   │   ├── Header.tsx                  # Application header
│   │   ├── Sidebar.tsx                 # Document sidebar
│   │   ├── ChatWindow.tsx              # Main chat container
│   │   ├── MessageList.tsx             # Message list with auto-scroll
│   │   ├── MessageItem.tsx             # Individual message component
│   │   ├── ChatInput.tsx               # Message input field
│   │   └── DocumentPicker.tsx          # File upload component
│   │
│   ├── lib/                            # Utilities & Types
│   │   ├── utils.ts                    # Helper functions (localStorage, formatting)
│   │   └── types.ts                    # TypeScript type definitions
│   │
│   ├── globals.css                     # Global styles & Tailwind imports
│   ├── layout.tsx                      # Root layout component
│   └── page.tsx                        # Main application page
│
├── uploads/                            # Document storage directory
│   └── .gitkeep                        # Ensures directory is tracked
│
├── .env.example                        # Environment variables template
├── .eslintrc.json                      # ESLint configuration
├── .gitignore                          # Git ignore rules
├── ARCHITECTURE.md                     # Architecture documentation
├── FOLDER_STRUCTURE.md                 # This file
├── next.config.js                      # Next.js configuration
├── package.json                        # Dependencies & scripts
├── postcss.config.js                   # PostCSS configuration
├── README.md                           # Setup & usage instructions
└── tailwind.config.ts                  # TailwindCSS configuration
```

## Key Directories

### `app/actions/`
Server-side logic using Next.js Server Actions. These run on the server and handle:
- AI chat completion with streaming
- Document file operations
- API integrations

### `app/components/`
All React components following a modular structure. Each component has a single responsibility:
- **Header**: Branding and navigation
- **Sidebar**: Document management UI
- **ChatWindow**: Main chat interface wrapper
- **MessageList**: Message rendering and scrolling
- **MessageItem**: Individual message display with markdown
- **ChatInput**: User input handling
- **DocumentPicker**: File upload with drag & drop

### `app/lib/`
Shared utilities and type definitions:
- **utils.ts**: localStorage operations, formatting helpers
- **types.ts**: TypeScript interfaces for Message and Document

### `uploads/`
Server-side directory for storing uploaded documents. Created automatically on first upload.

## File Count Summary

- **Components**: 7 files
- **Server Actions**: 2 files
- **Utilities**: 2 files
- **Configuration**: 6 files
- **Documentation**: 3 files
- **Root Files**: 2 files (layout.tsx, page.tsx, globals.css)

**Total**: ~26 files
