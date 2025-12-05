# 🖥️ Kiosk Mode Feature

## Overview

The Court Kiosk system now supports two distinct display modes:
- **Website Mode**: Optimized for desktop/web viewing with smaller, more aesthetically pleasing UI elements
- **Kiosk Mode**: Optimized for touch-screen kiosks with larger buttons, text, and touch-friendly interfaces

## Features

### Admin-Controlled Toggle
- Only administrators can enable/disable kiosk mode
- Toggle button located in the Admin Dashboard header
- Setting persists in localStorage
- Visual indicator shows current mode (purple = website, orange = kiosk)

### Visual Differences

#### Website Mode (Default)
- **Smaller Cards**: Compact, elegant design
- **Refined Typography**: Smaller font sizes (1.75rem titles, 1rem descriptions)
- **Subtle Hover Effects**: Gentle scale and shadow transitions
- **Tighter Spacing**: Optimized for mouse/keyboard navigation
- **Modern Aesthetics**: Enhanced shadows, rounded corners, refined spacing

#### Kiosk Mode
- **Larger Cards**: Bigger touch targets (3rem padding, 280px min-height)
- **Larger Typography**: Bigger fonts for readability (3rem titles, 1.5rem descriptions)
- **Touch-Friendly**: Larger buttons (4rem min-height, 1.5rem font)
- **Increased Spacing**: More padding and gaps for easier interaction
- **Queue Numbers**: Extra large display (9xl font size)

## Implementation Details

### Context Provider
- **File**: `frontend/src/contexts/KioskModeContext.js`
- **State Management**: Uses React Context API
- **Persistence**: Saves to localStorage
- **Admin Check**: Integrates with AuthContext to verify admin status

### Styling
- **File**: `frontend/src/styles/kiosk-mode.css`
- **CSS Classes**: `.kiosk-mode` and `.website-mode`
- **Responsive**: Adapts to screen size while maintaining mode-specific sizing

### Components Updated
1. **UserKiosk.jsx**: Main landing page with case type selection
2. **AdminDashboard.jsx**: Admin toggle button
3. **ExperimentIndex.jsx**: Alternative landing page

## Usage

### For Administrators

1. **Log in** to the Admin Dashboard
2. **Click the Kiosk Mode button** in the header
   - Purple button = Currently in Website Mode (click to switch to Kiosk)
   - Orange button = Currently in Kiosk Mode (click to switch to Website)
3. **Mode applies globally** to all users viewing the site
4. **Setting persists** until changed by an admin

### Visual Comparison

#### Case Type Cards
- **Website**: 200px min-height, 1.5rem padding, 3xl titles
- **Kiosk**: 280px min-height, 3rem padding, 5xl titles

#### Buttons
- **Website**: 2.75rem min-height, 0.95rem font, 0.75rem padding
- **Kiosk**: 4rem min-height, 1.5rem font, 1.25rem padding

#### Queue Numbers
- **Website**: 4rem font size
- **Kiosk**: 8rem font size

## Technical Details

### State Management
```javascript
const { isKioskMode, toggleKioskMode, isAdmin } = useKioskMode();
```

### Conditional Styling
```javascript
const modeClass = isKioskMode ? 'kiosk-mode' : 'website-mode';
<div className={`container ${modeClass}`}>
```

### Dynamic Sizing
```javascript
className={`${isKioskMode ? 'text-5xl' : 'text-3xl'}`}
```

## Benefits

1. **Better User Experience**: Optimized UI for each use case
2. **Accessibility**: Larger touch targets in kiosk mode
3. **Flexibility**: Easy switching between modes
4. **Professional Appearance**: Website mode maintains elegant design
5. **Kiosk Optimization**: Larger elements reduce errors on touch screens

## Future Enhancements

- Per-device kiosk mode detection
- Automatic mode switching based on screen size
- Kiosk-specific features (auto-refresh, timeout handling)
- Enhanced touch gestures in kiosk mode
- Kiosk mode analytics

## Configuration

The kiosk mode setting is stored in:
- **localStorage key**: `kioskMode`
- **Value**: `'true'` or `'false'` (string)
- **Default**: `false` (Website Mode)

## Security

- Only authenticated admin users can toggle kiosk mode
- Admin status verified through AuthContext
- Setting applies globally but requires admin authentication to change

