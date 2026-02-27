# Changes Made - Contact/Accuracy Modes + UI Improvements

## Overview
Major update to support dual practice modes (Contact & Accuracy) for Driver/Iron/Wedge, renamed ball flight labels, and adjusted button sizing for better UX.

## Key Changes

### 1. Dual Practice Modes

**Both Contact and Accuracy categories now include:**
- Driver
- Iron (with type selection)
- Wedge

**Contact Mode** (Strike Quality Focus):
- **Purpose**: Track solid contact and strike quality
- **Buttons**:
  - Hook (←←)
  - Leak Left (←) - renamed from "Draw"
  - **PURE (★)** - LARGER, central focus
  - Slight Right (→) - renamed from "Fade"
  - Slice (→→)
  - Mishits (smaller buttons): Top, Chunk, Hosel

**Accuracy Mode** (Target Precision Focus):
- **Purpose**: Track distance control and target precision
- **Buttons**:
  - **ON TARGET (🎯)** - LARGER, central button
  - Direction buttons: Left (←), Right (→)
  - Distance buttons: Short (⬇), Long (⬆)
  - Mishits (smaller buttons): Top, Chunk, Hosel

### 2. Button Sizing Changes

**Large Buttons:**
- PURE button (Contact mode)
- ON TARGET button (Accuracy mode)
- Specs: min-height 120px, border-width 4px, larger font

**Standard Buttons:**
- Ball flight: Hook, Leak Left, Slight Right, Slice
- Direction/Distance: Left, Right, Short, Long
- Specs: min-height 80px, border-width 2px

**Small Buttons:**
- All mishit buttons: Top, Chunk, Hosel
- Specs: min-height 60px, smaller font, reduced opacity

### 3. Label Changes

**Renamed for clarity:**
- "Draw" → "Leak Left"
- "Fade" → "Slight Right"

### 4. Navigation Flow

```
Home
├── CONTACT → Driver / Iron / Wedge (Contact Mode)
├── ACCURACY → Driver / Iron / Wedge (Accuracy Mode)
└── PUTTING → Make/Miss / Speed Control
```

### 5. Statistics Updates

**Pure/On-Target Percentage:**
- Now combines both `pure_count` and `on_target_count`
- Displayed as single percentage in live stats
- Makes sense across both modes

**New Database Columns:**
- `leak_left_count` (replaces draw_count)
- `slight_right_count` (replaces fade_count)
- `on_target_count`
- `left_count`
- `right_count`
- `short_count`
- `long_count`

**New Shot Category:**
- Added `accuracy` to shot_category CHECK constraint

## Files Modified

### HTML/Frontend
- `index.html`
  - Added practice-mode data attribute to club buttons
  - Created separate contact-section and accuracy-section
  - Integrated mishits into each mode's section
  - Updated button labels (Leak Left, Slight Right)

### CSS
- `public/styles/practice.css`
  - New `.large-btn` class for PURE/On-Target
  - New `.small-btn` class for mishits
  - Added `.contact-grid` layout
  - Added `.accuracy-grid` + `.direction-buttons` layout
  - Color-coded new buttons (on-target, left/right, short/long)
  - Added opacity to mishit buttons for de-emphasis

### JavaScript - Client
- `src/client/main.js`
  - Added `currentPracticeMode` state variable
  - Updated club button handler to capture practice-mode
  - Updated iron modal to pass practice mode
  - Updated startSession() to accept and display practice mode

- `src/client/ui.js`
  - Updated `configurePracticeScreen()` to handle practice modes
  - Shows contact-section or accuracy-section based on mode

- `src/client/practice.js`
  - Updated `calculateLiveStats()` with new shot types
  - Combined pure_count + on_target_count for percentage

### JavaScript - Server
- `src/server/utils/analytics.js`
  - Updated `calculateSessionStats()` with all new shot types
  - Combined pure + on-target for percentage calculation

- `src/server/routes/sessions.js`
  - Updated INSERT statement with all new stat columns

### Database
- `src/database/schema.sql`
  - Added `accuracy` to shot_category constraint
  - Renamed draw_count → leak_left_count
  - Renamed fade_count → slight_right_count
  - Added 5 new accuracy stat columns

## Testing Guide

### Test Contact Mode
1. Home → CONTACT → Driver
2. Record: Hook, Leak Left, PURE (x3), Slight Right, Slice
3. Record mishits: Top, Chunk
4. Verify PURE button is larger, mishits are smaller
5. Check live stats show combined percentage
6. End session and review

### Test Accuracy Mode
1. Home → ACCURACY → 7i
2. Record: ON TARGET (x5), Left (x2), Right, Short, Long
3. Record mishit: Hosel
4. Verify ON TARGET is large and central
5. Direction buttons work correctly
6. End session and review

### Test Both Modes with Same Club
1. Do Driver - Contact mode
2. Do Driver - Accuracy mode
3. Verify different button layouts
4. Check stats track separately

## Visual Layout

### Contact Mode
```
┌─────────────────────────────┐
│  Hook  Leak   PURE  Slight  │
│        Left          Right   │
│                      Slice   │
├─────────────────────────────┤
│  [Top]  [Chunk]  [Hosel]    │
└─────────────────────────────┘
```

### Accuracy Mode
```
┌─────────────────────────────┐
│      ON TARGET (LARGE)      │
├─────────────────────────────┤
│   [Left]       [Right]      │
│   [Short]      [Long]       │
├─────────────────────────────┤
│  [Top]  [Chunk]  [Hosel]    │
└─────────────────────────────┘
```

## Design Rationale

### Why Two Modes?
- **Contact**: For range sessions focused on strike quality
- **Accuracy**: For target practice focused on precision
- Same clubs, different feedback mechanisms
- Tracks different aspects of performance

### Why Larger PURE/On-Target?
- Primary success metric in each mode
- Should be easiest to tap quickly
- Visual emphasis on positive outcomes
- Reduces mis-taps during rapid logging

### Why Smaller Mishits?
- Less frequent (hopefully!)
- De-emphasizes negative outcomes
- Saves screen space for primary buttons
- Still easily accessible when needed

### Label Changes
- "Leak Left" more descriptive than "Draw" for slight pull
- "Slight Right" more descriptive than "Fade" for push
- Clearer for golfers of all skill levels
- Better describes unintentional vs intentional shapes

## Migration Notes

**Database:** Fresh initialization required (schema changes). Old sessions won't be compatible.

**Active Sessions:** Will need to be discarded if in progress during update.

**API:** Backwards compatible for read operations. Write operations use new shot types.

## Future Enhancements

- Session notes could indicate mode used
- Summary could show mode-specific insights
- History could filter by practice mode
- Compare Contact vs Accuracy stats over time
- Add "Intended" toggle for Leak Left/Slight Right

## Questions?

See CHANGES.md for v1 changes (category reorganization + putting modes)
See README.md for general documentation
