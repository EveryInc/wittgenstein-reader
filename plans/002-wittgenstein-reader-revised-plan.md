# Wittgenstein Reader App - Revised Plan

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
  number: string;  // Changed to string to handle complex numbering (1, 1.1, 1.11, etc.)
  text: string;
  explanation: string;
  section?: string;  // Part I or Part II
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
    raw/              // Raw text files for processing
  /contexts
    AppContext.tsx    // Global state management
  /styles
    globals.css       // Base styles and Tailwind
  /utils
    textParser.ts     // Parser for PI text format
  App.tsx            // Main app component
  main.tsx          // Entry point
/scripts
  parsePI.js         // Script to parse raw text into structured data
```

## Implementation Phases

### Phase 0: Text Acquisition & Processing (3-4 hours) - NEW PHASE
1. Download the Philosophical Investigations text from archive.org
   - Use the text format for easier parsing: https://archive.org/details/philosophicalinvestigations_201911
2. Create a parsing script to extract propositions
   - Handle the unique numbering system (1, 1.1, 1.11, 1.12, 1.13, 1.2, 1.21, etc.)
   - Preserve formatting (italics, quotes, German phrases)
   - Separate Part I (numbered propositions) from Part II (sections)
3. Generate structured JSON data file with all propositions
4. Validate the parsing output against the original text

### Phase 1: Foundation (2-3 hours)
1. Set up React + TypeScript + Vite project
2. Install dependencies (Tailwind, Framer Motion)
3. Create basic project structure
4. Set up mobile viewport and base styles
5. Import parsed proposition data

### Phase 2: Core Components (3-4 hours)
1. Build Card component with proposition display
2. Implement card flip animation
3. Add touch gesture detection (tap vs long press)
4. Create navigation overlay component

### Phase 3: Data Integration & Explanations (4-5 hours) - EXPANDED
1. Integrate parsed proposition data
2. Create initial explanations for first 50 propositions
   - Focus on accessibility and clarity
   - Include context where helpful
   - Reference related propositions when relevant
3. Build explanation authoring workflow
4. Implement navigation between propositions

### Phase 4: Polish & Testing (2-3 hours)
1. Fine-tune animations and transitions
2. Optimize for different mobile devices
3. Add loading states and error handling
4. Test on various devices and browsers
5. Ensure proper handling of special characters and formatting

## Text Processing Details

### Parsing Challenges
1. **Complex Numbering**: PI uses a hierarchical numbering system (1, 1.1, 1.11, etc.)
2. **Mixed Languages**: Contains German phrases and quotations
3. **Special Formatting**: Italics, quotation marks, em-dashes
4. **Variable Length**: Some propositions are single sentences, others are paragraphs
5. **Cross-references**: Propositions often reference other numbered sections

### Parsing Strategy
```javascript
// Example parsing approach
const parsePropositions = (rawText) => {
  // Regular expression to match proposition numbers
  const propRegex = /^(\d+\.?\d*)\.\s+(.+?)(?=^\d+\.?\d*\.|$)/gms;
  
  // Extract propositions
  const propositions = [];
  let match;
  
  while ((match = propRegex.exec(rawText)) !== null) {
    propositions.push({
      number: match[1],
      text: cleanText(match[2]),
      explanation: '', // To be filled manually
      section: 'Part I'
    });
  }
  
  return propositions;
};
```

## Design Considerations

### Visual Design
- Clean, minimalist interface
- High contrast for readability
- Large, legible typography (min 16px)
- Sufficient padding for touch targets (min 44px)
- Subtle shadows for card depth
- Proper rendering of special characters and formatting

### User Experience
- Instant feedback for all interactions
- Clear visual affordances for interactive elements
- Smooth, not jarring animations
- Persistent state (remember last viewed proposition)
- Offline-first (all data embedded)
- Handle long propositions with scrollable cards

## Technical Decisions

### Why Parse the Text Ourselves?
- Ensures accuracy and control over formatting
- Can preserve the exact structure Wittgenstein intended
- Allows for future enhancements (search, cross-references)
- One-time process that creates reusable data

### Why Embed All Data?
- No API needed, works completely offline
- Fast loading and navigation
- Simpler deployment
- Better user privacy

## Explanation Writing Guidelines

### For Each Proposition:
1. **Context**: What philosophical problem is being addressed?
2. **Core Idea**: What is the main point in simple terms?
3. **Example**: When helpful, provide a concrete example
4. **Connection**: How does this relate to nearby propositions?
5. **Length**: Keep explanations concise (2-4 sentences typical)

### Example Explanation Format:
```typescript
{
  number: "1",
  text: "The world is all that is the case.",
  explanation: "Wittgenstein opens by defining the world not as a collection of things, but as the totality of facts or states of affairs that actually exist. This sets up his picture theory of language, where propositions mirror the logical structure of reality."
}
```

## Future Enhancements (Not Phase 1)
- Search functionality with full-text search
- Bookmark favorite propositions
- Reading progress tracking
- Dark mode
- Swipe gestures for next/previous
- Cross-reference navigation
- German/English toggle for multilingual sections
- Community explanations or notes
- PWA capabilities for app-like experience

## Development Approach
1. First parse and structure the complete text
2. Start with robust data foundation
3. Build UI incrementally with real content
4. Write explanations in batches as development progresses
5. Test with actual philosophical readers for feedback

## Success Criteria
- Accurately represents the original text structure
- Loads quickly on mobile devices
- Smooth, responsive interactions
- Explanations genuinely help understanding
- Preserves the philosophical rigor while increasing accessibility
- Works reliably across different devices

## Resources
- Source text: https://archive.org/details/philosophicalinvestigations_201911
- Stanford Encyclopedia entry on PI: https://plato.stanford.edu/entries/wittgenstein/#TracLogiPhil
- Secondary sources for explanation writing