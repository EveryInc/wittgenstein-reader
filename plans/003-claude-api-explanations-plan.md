# Plan: Generate Missing Explanations Using Claude API

## Overview
Create a script to generate missing explanations for 70 propositions (13-54, 83-96, 111-124) using Claude Opus 4 API, matching the style and depth of existing explanations.

## Current State Analysis
- Total propositions needing explanations: 140 (propositions 1-140)
- Currently completed: 70 explanations
- Missing ranges:
  - 13-54 (42 propositions)
  - 83-96 (14 propositions)
  - 111-124 (14 propositions)

## Existing Explanation Structure
Each explanation contains:
```json
{
  "number": {
    "brief": "2-3 sentence accessible summary",
    "comprehensive": "Deep, scholarly analysis with:\n- Context and philosophical background\n- Sentence-by-sentence analysis\n- Examples where helpful\n- Connections to other propositions\n- Markdown formatting with **bold** sections"
  }
}
```

## Script Architecture

### 1. Setup Phase
- Install Anthropic SDK: `npm install @anthropic-ai/sdk`
- Create `.env` file for API key
- Set up TypeScript configuration

### 2. Core Components

#### a. Data Loader (`src/scripts/loadData.ts`)
```typescript
// Load existing explanations
// Load propositions data
// Identify missing explanation ranges
// Extract style patterns from existing explanations
```

#### b. Prompt Builder (`src/scripts/promptBuilder.ts`)
```typescript
// Create context from nearby explanations
// Build systematic prompt structure
// Include examples of existing explanations
// Specify formatting requirements
```

#### c. API Client (`src/scripts/claudeClient.ts`)
```typescript
// Initialize Anthropic client
// Handle rate limiting (5 requests/minute for Opus)
// Implement retry logic
// Error handling and logging
```

#### d. Batch Processor (`src/scripts/batchProcessor.ts`)
```typescript
// Process propositions in batches of 5-10
// Save progress after each batch
// Resume capability for interruptions
// Validation of generated content
```

#### e. JSON Updater (`src/scripts/updateExplanations.ts`)
```typescript
// Merge new explanations with existing
// Validate JSON structure
// Create backup before updating
// Write final comprehensive_explanations_full.json
```

## Prompt Engineering Strategy

### System Prompt
```
You are a Wittgenstein scholar creating explanations for Philosophical Investigations propositions. Your explanations should:
1. Be deeply insightful yet accessible
2. Include both brief (2-3 sentence) and comprehensive analysis
3. Use markdown formatting for the comprehensive section
4. Connect to nearby propositions when relevant
5. Provide concrete examples where helpful
```

### Example Format to Include
Show 3-5 examples of excellent existing explanations (e.g., propositions 1, 7, 11, 55, 65)

### Per-Proposition Prompt Template
```
Create explanations for Philosophical Investigations proposition {number}:

Text: "{proposition_text}"

Context: 
- Previous proposition ({prev_num}): {prev_text}
- Next proposition ({next_num}): {next_text}

Nearby explanations for reference:
{nearby_explanations}

Generate:
1. Brief explanation (2-3 sentences, accessible)
2. Comprehensive explanation (scholarly depth, markdown formatted)
```

## Implementation Steps

### Phase 1: Infrastructure (30 minutes)
1. Create scripts directory structure
2. Install dependencies
3. Set up TypeScript compilation
4. Configure environment variables

### Phase 2: Core Script Development (2-3 hours)
1. Build data loading utilities
2. Create prompt builder with examples
3. Implement Claude API client with rate limiting
4. Build batch processing logic

### Phase 3: Generation Process (2-4 hours)
1. Test with 5 propositions first
2. Review quality and adjust prompts
3. Process all 70 missing propositions in batches
4. Monitor for consistency and quality

### Phase 4: Integration (30 minutes)
1. Validate all generated explanations
2. Merge with existing explanations
3. Test in the running application
4. Final quality check

## Quality Assurance Checklist

### For Each Generated Explanation:
- [ ] Brief explanation is 2-3 sentences
- [ ] Comprehensive explanation has proper markdown
- [ ] No hallucinated content about the proposition
- [ ] Maintains scholarly yet accessible tone
- [ ] Connects to philosophical context appropriately
- [ ] Examples (if included) are relevant and clear

### Batch Processing Controls:
- [ ] Save after every 5 successful generations
- [ ] Log all API responses for review
- [ ] Implement manual review checkpoint every 20 propositions
- [ ] Maintain consistent style across batches

## Error Handling

1. **API Errors**: Exponential backoff with max 3 retries
2. **Content Issues**: Flag for manual review, continue with next
3. **Rate Limits**: Automatic delay between requests (12 seconds minimum)
4. **Validation Failures**: Save to separate file for manual correction

## Script Execution Plan

```bash
# Step 1: Setup
npm install @anthropic-ai/sdk dotenv
mkdir -p src/scripts

# Step 2: Create main script
npm run build:scripts
node dist/scripts/generateExplanations.js --test 5

# Step 3: Full generation
node dist/scripts/generateExplanations.js --all --batch-size 10

# Step 4: Verify
node dist/scripts/validateExplanations.js
```

## Cost Estimation
- ~70 propositions × ~1000 tokens per request = 70,000 tokens
- Estimated cost: ~$1-2 for all generations
- Time: 15-20 minutes of API calls (with rate limiting)

## Success Metrics
1. All 140 propositions have both brief and comprehensive explanations
2. Consistent style and quality across all explanations
3. Application displays all explanations correctly
4. No parsing or rendering errors

## Next Steps After Completion
1. Review a sample of generated explanations
2. Run the application to verify all explanations display
3. Consider creating a review/editing interface
4. Backup the completed explanations file