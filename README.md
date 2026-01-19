# EPUB 簡繁轉換 (EPUB Simplified to Traditional Chinese Converter)

A Next.js 14 application for converting Simplified Chinese EPUB files to Traditional Chinese.

## Features

- 📚 Convert Simplified Chinese EPUB files to Traditional Chinese
- 🎨 Dark/Light theme toggle
- 📤 Drag-and-drop file upload
- 📊 Real-time conversion progress tracking
- 🌐 Traditional Chinese UI
- ⚡ Fast conversion using OpenCC (WASM)
- 🔒 Server-side processing for privacy

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.x
- **Conversion**: OpenCC-JS (WASM) with yauzl/yazl for streaming
- **Testing**: Vitest, Playwright
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended)

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### Environment Variables

Create a `.env.local` file:

```env
MAX_UPLOAD_BYTES=20971520  # 20 MiB
LOG_LEVEL=info
```

## Testing

```bash
# Run unit tests
pnpm test

# Run e2e tests
pnpm test:e2e
```

## Project Structure

```
epub_convert_nextjs/
├── app/                    # Next.js app directory
│   ├── api/convert/       # API route for conversion
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── ThemeProvider.tsx
│   ├── ThemeToggle.tsx
│   ├── Toast.tsx
│   ├── ProgressBar.tsx
│   └── UploadForm.tsx
├── lib/                   # Core library code
│   ├── converter/         # Conversion logic
│   │   ├── index.ts      # Main conversion pipeline
│   │   ├── opencc.ts     # OpenCC integration
│   │   └── encoding.ts   # Encoding detection
│   ├── env.ts            # Environment validation
│   └── utils.ts          # Utility functions
├── types/                 # TypeScript type definitions
└── tests/                 # Unit and e2e tests
```

## API

### POST /api/convert

Convert an EPUB file from Simplified to Traditional Chinese.

**Request:**
- Content-Type: `multipart/form-data`
- Field: `upload` (EPUB file)

**Response:**
- Success (200): Binary EPUB file with `Content-Disposition` header
- Error (400/413/415/500): JSON with error message

## Deployment

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

## License

ISC

## Migrated From

This project is a Next.js migration of the original Flask-based EPUB converter, maintaining all functionality while modernizing the tech stack.
