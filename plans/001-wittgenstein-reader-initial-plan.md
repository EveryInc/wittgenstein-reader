# Wittgenstein Reader App - Initial Plan

## Project Overview
A mobile-friendly web application designed as a companion for reading Wittgenstein's *Philosophical Investigations*. The app displays numbered propositions in a card-based interface with tap interactions for explanations and long-press for navigation.

## Core Features

### 1. Card Display System
- Display propositions as individual cards
- Show proposition number prominently
- Full text of each proposition on the front of the card
- Clean, readable typography optimized for mobile screens

### 2. Single Tap - Card Flip
- Tap once to flip card with smooth animation
- Back of card shows simple, accessible explanation
- Tap again to flip back to original proposition
- Visual indicator that card can be flipped

### 3. Long Press - Navigation
- Long press (500ms+) triggers navigation overlay
- Scrollable list of all proposition numbers
- Quick jump to any proposition
- Current proposition highlighted
- Smooth dismissal when tapping outside

### 4. Mobile-First Design
- Responsive layout that works on all screen sizes
- Touch-optimized interactions
- No hover states, focus on tap/press gestures
- Minimal UI chrome to maximize reading space

## Technical Architecture

### Frontend Stack
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS for rapid mobile-first development
- **State Management**: React Context for simple state (current proposition, flip state)
- **Animations**: Framer Motion for smooth card flips and transitions
- **Build Tool**: Vite for fast development

### Data Structure
```typescript
interface Proposition {
  number: number;
  text: string;
  explanation: string;
}
```

### Project Structure
```
/src
  /components
    Card.tsx          // Main proposition card component
    Navigation.tsx    // Long-press navigation overlay
    CardFlip.tsx     // Flip animation wrapper
  /data
    propositions.ts   // All propositions and explanations
  /contexts
    AppContext.tsx    // Global state management
  /styles
    globals.css       // Base styles and Tailwind
  App.tsx            // Main app component
  main.tsx          // Entry point
```

## Implementation Phases

### Phase 1: Foundation (2-3 hours)
1. Set up React + TypeScript + Vite project
2. Install dependencies (Tailwind, Framer Motion)
3. Create basic project structure
4. Set up mobile viewport and base styles
MYFEEDBACK: you'll need to actually get the full text of the PI. here's a PDF on archive: https://ia803103.us.archive.org/23/items/philosophicalinvestigations_201911/Philosophical%20Investigations_text.pdf. here's all formats: https://archive.org/details/philosophicalinvestigations_201911. you'll also need to break it up into propositions


### Phase 2: Core Components (3-4 hours)
1. Build Card component with proposition display
2. Implement card flip animation
3. Add touch gesture detection (tap vs long press)
4. Create navigation overlay component

### Phase 3: Data Integration (2-3 hours)
1. Structure proposition data (start with first 20-30 propositions)
2. Create explanation content for each proposition
3. Connect data to components
4. Implement navigation between propositions

### Phase 4: Polish & Testing (2-3 hours)
1. Fine-tune animations and transitions
2. Optimize for different mobile devices
3. Add loading states and error handling
4. Test on various devices and browsers

## Design Considerations

### Visual Design
- Clean, minimalist interface
- High contrast for readability
- Large, legible typography (min 16px)
- Sufficient padding for touch targets (min 44px)
- Subtle shadows for card depth

### User Experience
- Instant feedback for all interactions
- Clear visual affordances for interactive elements
- Smooth, not jarring animations
- Persistent state (remember last viewed proposition)
- Offline-first (all data embedded)

## Technical Decisions

### Why React?
- Excellent mobile support
- Rich ecosystem for gestures and animations
- Component-based architecture perfect for card UI
- TypeScript support for maintainability

### Why Tailwind CSS?
- Mobile-first utility classes
- Rapid prototyping
- Consistent spacing and sizing
- Easy responsive design

### Why Client-Side Only?
- No server needed for simple reading app
- Can be deployed as static site (GitHub Pages, Netlify)
- Works offline once loaded
- Fast and responsive

## Future Enhancements (Not Phase 1)
- Search functionality
- Bookmark favorite propositions
- Reading progress tracking
- Dark mode
- Swipe gestures for next/previous
- Add more propositions over time
- PWA capabilities for app-like experience

## Development Approach
1. Start with minimal viable product (first 10 propositions)
2. Focus on core interactions working perfectly
3. Test extensively on actual mobile devices
4. Iterate based on real usage
5. Keep it simple and focused on the reading experience

## Success Criteria
- Loads quickly on mobile devices
- Smooth, responsive interactions
- Easy to read and navigate
- Helps understand complex philosophical concepts
- Works reliably across different devices