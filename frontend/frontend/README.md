# Maintenance Application Frontend

Modern React application for maintenance management with professional RFID login system.

## Features

- **Touchless RFID Login**: Professional RFID terminal with automatic card scanning
- **Fallback Login**: Classic username/password login option
- **Modern UI**: Material-UI components with professional animations
- **Responsive Design**: Works on all devices
- **TypeScript**: Full type safety
- **Real-time Updates**: Live data synchronization
- **Error Handling**: Comprehensive error management
- **Accessibility**: WCAG compliant design

## Technology Stack

- **React 19** - Latest React with concurrent features
- **TypeScript** - Full type safety and better development experience
- **Material-UI (MUI)** - Professional UI components
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API communication
- **Date-fns** - Modern date utility library
- **Recharts** - Professional charts and data visualization

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd maintenance-app-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm run clean` - Clean build artifacts
- `npm run type-check` - Run TypeScript type checking

## RFID Login System

The application features a professional RFID login system with:

- **Automatic Detection**: Cards are automatically detected and scanned
- **Visual Feedback**: Professional animations and status indicators
- **Error Recovery**: Graceful error handling and recovery
- **Fallback Option**: Classic username/password login when needed
- **Professional UI/UX**: Modern, accessible design

### How it Works

1. **Card Detection**: RFID reader automatically detects when a card is presented
2. **Visual Feedback**: Terminal shows scanning status with animations
3. **Authentication**: Card data is sent to backend for validation
4. **Success/Error**: User receives immediate feedback on login status
5. **Fallback**: If card is unavailable, users can use classic login

## Project Structure

```
src/
├── components/
│   └── TouchlessRfidTerminal.tsx  # Main RFID login component
├── pages/
│   └── LoginPage.tsx               # Login page with RFID terminal
├── services/
│   └── authService.ts              # Authentication service
├── hooks/
│   └── useRfidReader.ts           # RFID reader hook
├── theme/
│   └── designSystem.ts            # Design system configuration
├── styles/
│   └── calendar.css               # Calendar component styles
└── types/
    └── mui-icons.d.ts            # Material-UI icon types
```

## Development

### Code Style

- ESLint for code linting
- TypeScript for type safety
- Prettier for code formatting (recommended)

### Testing

- Unit tests with Jest (planned)
- Integration tests with React Testing Library (planned)
- E2E tests with Playwright (planned)

### Deployment

The application can be deployed to any static hosting service:

- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod`
- **GitHub Pages**: `npm run build && gh-pages -d dist`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please contact the maintenance team.
