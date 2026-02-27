# AllSwing Golf Practice Tracker

A mobile-first web application for tracking golf practice sessions and monitoring improvement over time.

## Features

- **Club Modes**: Track practice with Driver, Iron (5i-PW), Wedge, and Putter
- **Quick Shot Tracking**: Tap-based interface for rapid shot logging
- **Shot Types**:
  - Ball Flight: Hook, Draw, Pure, Fade, Slice
  - Mishits: Top, Chunk, Hosel
  - Putting: Make, Miss
- **Live Statistics**: Real-time pure percentage and recent shots
- **Session History**: View and analyze past practice sessions
- **Offline-Ready**: Uses localStorage for session persistence

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6 modules) + Vite
- **Backend**: Express.js
- **Database**: SQLite with better-sqlite3
- **Styling**: Pure CSS (mobile-first)

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm

### Installation

1. Clone the repository:
```bash
cd allswing-golf-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Initialize the database:
```bash
npm run db:init
```

4. Start the development server:
```bash
npm run start:all
```

5. Open your browser to http://localhost:3000

## Available Scripts

- `npm run dev:server` - Start backend server only (port 3001)
- `npm run dev:client` - Start frontend dev server only (port 3000)
- `npm run start:all` - Start both frontend and backend concurrently
- `npm run build` - Build frontend for production
- `npm start` - Start production server (serves built frontend)
- `npm run db:init` - Initialize/reset database

## Project Structure

```
allswing-golf-tracker/
├── data/                   # SQLite database
├── public/                 # Static assets
│   └── styles/            # CSS files
├── src/
│   ├── client/            # Frontend JavaScript modules
│   │   ├── main.js       # Entry point
│   │   ├── api.js        # API client
│   │   ├── practice.js   # Session management
│   │   ├── ui.js         # DOM manipulation
│   │   └── history.js    # History screen
│   ├── database/          # Database setup
│   └── server/            # Backend
│       ├── server.js     # Express app
│       ├── routes/       # API routes
│       └── utils/        # Helper functions
├── index.html             # Main HTML file
└── vite.config.js         # Vite configuration
```

## API Endpoints

### Sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/status/active` - Get active session
- `GET /api/sessions/:id` - Get session details
- `PUT /api/sessions/:id/end` - End session
- `GET /api/sessions` - Get session history
- `DELETE /api/sessions/:id` - Delete session

### Shots
- `POST /api/shots` - Record a shot
- `GET /api/shots/session/:sessionId` - Get session shots
- `DELETE /api/shots/:id` - Delete shot (undo)

## Deployment

### Railway

1. Push your code to GitHub
2. Connect repository to Railway
3. Set environment variable:
   - `NODE_ENV=production`
4. Railway will automatically build and deploy

The app includes `railway.json` and `nixpacks.toml` for automatic configuration.

### Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

## Usage Guide

### Starting a Practice Session

1. Select your club type (Driver, Iron, Wedge, or Putter)
2. For Irons, choose your specific iron (5i-PW)
3. Start hitting shots and tap the corresponding button

### During Practice

- Tap shot buttons to log each shot
- View live statistics (pure %, recent shots)
- Use "Undo Last" to correct mistakes
- "End Session" when done

### Session Summary

- Review total shots and statistics
- Add optional notes about your session
- Save or discard the session

### Viewing History

- Click "View History" from home screen
- Filter by club type
- Tap any session to view details

## Mobile Optimization

- Designed mobile-first for quick on-course tracking
- Large touch targets (60px+)
- Responsive design works on all screen sizes
- Can be installed as PWA (home screen shortcut)

## Future Enhancements

- User authentication and cloud sync
- Advanced analytics and trends
- Shot distance tracking
- Practice goals and achievements
- Export data to CSV
- Native mobile app

## License

ISC

## Author

Built with AllSwing Golf Tracker
