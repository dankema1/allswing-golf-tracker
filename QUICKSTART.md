# AllSwing Golf Tracker - Quick Start Guide

## Development

### First Time Setup
```bash
cd /Users/domach/allswing-golf-tracker
npm install
npm run db:init
npm run start:all
```

Visit: http://localhost:3000

### Daily Development
```bash
npm run start:all
```

## Testing the App

### 1. Start a Driver Session
1. Click "Driver" button
2. Record shots: Click "PURE" (5x), "Hook" (2x), "Slice" (1x), "Top" (1x)
3. Watch live stats update
4. Click "Undo Last" to remove the Top shot
5. Click "End Session"
6. Add notes: "Morning practice - focusing on tempo"
7. Click "Save Session"

### 2. Start an Iron Session (7i)
1. Click "Iron" button
2. Select "7i"
3. Record: "Draw" (3x), "PURE" (4x), "Fade" (2x)
4. Click "End Session"
5. Click "Save Session"

### 3. Start a Putter Session
1. Click "Putter" button
2. Record: "MAKE" (7x), "MISS" (3x)
3. Notice different UI (no ball flight buttons)
4. Click "End Session"
5. See make percentage instead of pure percentage
6. Click "Save Session"

### 4. View History
1. Click "View History" from home
2. See all 3 sessions listed
3. Click "Iron" filter button
4. Click on a session to see details
5. Close modal
6. Click "← Back" to return home

## API Testing (Optional)

### Create Session
```bash
curl -X POST http://localhost:3001/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"club_mode":"driver"}'
```

### Record Shot
```bash
curl -X POST http://localhost:3001/api/shots \
  -H "Content-Type: application/json" \
  -d '{"session_id":1,"shot_type":"pure","shot_category":"ball_flight"}'
```

### Get Session History
```bash
curl http://localhost:3001/api/sessions
```

## Mobile Testing

1. Open http://localhost:3000 on your phone
2. Test touch targets (should be easy to tap)
3. Test in portrait and landscape
4. Add to home screen (PWA)

## Production Testing

```bash
npm run build
NODE_ENV=production npm start
```

Visit: http://localhost:3001

## File Structure

```
Key Files:
├── index.html                      # Main HTML
├── src/client/main.js              # Frontend entry point
├── src/server/server.js            # Backend entry point
├── src/database/schema.sql         # Database schema
├── public/styles/main.css          # Base styles
└── public/styles/practice.css      # Practice screen styles
```

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process on port 3000 or 3001
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Database Issues
```bash
# Reset database
rm data/allswing.db
npm run db:init
```

### Clear Session Data
Open browser console and run:
```javascript
localStorage.clear()
```

## Next Steps

1. ✅ Test all features
2. ✅ Test on mobile device
3. ✅ Create some practice sessions
4. Push to GitHub
5. Deploy to Railway
6. Share with golfers!

## Support

For issues or questions:
- Check the README.md
- Review the plan document
- Check browser console for errors
- Review server logs

Happy golfing! 🏌️
