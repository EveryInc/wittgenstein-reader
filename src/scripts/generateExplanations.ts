import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Types
interface Proposition {
  number: string;
  text: string;
  explanation: string;
  section: string;
}

interface Explanation {
  brief: string;
  comprehensive: string;
}

type ExplanationsData = Record<string, Explanation>;

// Configuration
const CONFIG = {
  apiKey: process.env.CLAUDE_API_KEY || '',
  model: 'claude-opus-4-20250514',
  maxTokens: 2000,
  temperature: 0.7,
  rateLimit: 12000, // 12 seconds between requests for safety
  batchSize: 5,
  saveEvery: 1,
};

// File paths
const PATHS = {
  propositions: path.join(__dirname, '../../src/data/propositions.json'),
  explanations: path.join(__dirname, '../../src/data/comprehensive_explanations_full.json'),
  backup: path.join(__dirname, '../../src/data/comprehensive_explanations_backup.json'),
  progress: path.join(__dirname, '../../src/data/generation_progress.json'),
};

// Load data
function loadData(): {
  propositions: Proposition[];
  existingExplanations: ExplanationsData;
  missingNumbers: string[];
  completed: string[];
} {
  const propositions = JSON.parse(fs.readFileSync(PATHS.propositions, 'utf-8')) as Proposition[];
  const existingExplanations = JSON.parse(fs.readFileSync(PATHS.explanations, 'utf-8')) as ExplanationsData;
  
  // Load progress if exists
  let completed: string[] = [];
  if (fs.existsSync(PATHS.progress)) {
    const progress = JSON.parse(fs.readFileSync(PATHS.progress, 'utf-8'));
    completed = progress.completed || [];
  }
  
  // Find missing explanations for propositions 1-140
  const missingNumbers: string[] = [];
  for (let i = 1; i <= 140; i++) {
    const num = i.toString();
    if (!existingExplanations[num] && !completed.includes(num)) {
      missingNumbers.push(num);
    }
  }
  
  return { propositions, existingExplanations, missingNumbers, completed };
}

// Create backup
function createBackup(data: ExplanationsData): void {
  fs.writeFileSync(PATHS.backup, JSON.stringify(data, null, 2));
  console.log('✓ Backup created');
}

// Get example explanations for context
function getExampleExplanations(explanations: ExplanationsData): string {
  const examples = ['1', '7', '11', '55', '65'];
  const availableExamples = examples.filter(num => explanations[num]);
  
  return availableExamples.slice(0, 3).map(num => {
    const exp = explanations[num];
    return `Proposition ${num}:
Brief: ${exp.brief}
Comprehensive: ${exp.comprehensive.substring(0, 300)}...`;
  }).join('\n\n');
}

// Get context for a proposition
function getContext(
  propNumber: string,
  propositions: Proposition[],
  explanations: ExplanationsData
): {
  proposition: Proposition;
  prevProp?: Proposition;
  nextProp?: Proposition;
  nearbyExplanations: string;
} | null {
  const index = propositions.findIndex(p => p.number === propNumber);
  if (index === -1) {
    return null;
  }
  const proposition = propositions[index];
  const prevProp = index > 0 ? propositions[index - 1] : undefined;
  const nextProp = index < propositions.length - 1 ? propositions[index + 1] : undefined;
  
  // Get nearby explanations that exist
  const nearbyNumbers = [
    parseInt(propNumber) - 2,
    parseInt(propNumber) - 1,
    parseInt(propNumber) + 1,
    parseInt(propNumber) + 2,
  ].map(n => n.toString()).filter(n => explanations[n]);
  
  const nearbyExplanations = nearbyNumbers.slice(0, 2).map(num => {
    const exp = explanations[num];
    return `Proposition ${num} (Brief): ${exp.brief}`;
  }).join('\n');
  
  return { proposition, prevProp, nextProp, nearbyExplanations };
}

// Build prompt for Claude
function buildPrompt(context: NonNullable<ReturnType<typeof getContext>>, examples: string): string {
  const { proposition, prevProp, nextProp, nearbyExplanations } = context;
  
  return `You are a Wittgenstein scholar creating explanations for Philosophical Investigations propositions. Your explanations should be deeply insightful yet accessible, connecting to the broader philosophical context while remaining clear.

EXAMPLES OF EXCELLENT EXPLANATIONS:
${examples}

NOW CREATE EXPLANATIONS FOR:
Proposition ${proposition.number}: "${proposition.text}"

${prevProp ? `Previous (${prevProp.number}): "${prevProp.text}"` : ''}
${nextProp ? `Next (${nextProp.number}): "${nextProp.text}"` : ''}

${nearbyExplanations ? `NEARBY EXPLANATIONS:\n${nearbyExplanations}` : ''}

Generate:
1. A brief explanation (2-3 sentences, accessible to general readers)
2. A comprehensive explanation that:
   - Provides philosophical context
   - Analyzes key concepts sentence by sentence where appropriate
   - Uses markdown formatting with **bold** for section headers
   - Includes concrete examples where helpful
   - Connects to related propositions when relevant
   - Maintains scholarly depth while being readable

Format your response as JSON:
{
  "brief": "Your brief explanation here",
  "comprehensive": "Your comprehensive explanation here"
}`;
}

// Initialize Claude client
function initializeClient(): Anthropic {
  if (!CONFIG.apiKey) {
    throw new Error('CLAUDE_API_KEY not found in environment variables');
  }
  return new Anthropic({ apiKey: CONFIG.apiKey });
}

// Generate explanation for a single proposition
async function generateExplanation(
  client: Anthropic,
  propNumber: string,
  propositions: Proposition[],
  explanations: ExplanationsData,
  examples: string
): Promise<Explanation> {
  const context = getContext(propNumber, propositions, explanations);
  if (!context) {
    console.warn(`⚠️  Proposition ${propNumber} not found in propositions data, skipping...`);
    throw new Error(`Proposition ${propNumber} not found`);
  }
  const prompt = buildPrompt(context, examples);
  
  try {
    const response = await client.messages.create({
      model: CONFIG.model,
      max_tokens: CONFIG.maxTokens,
      temperature: CONFIG.temperature,
      messages: [{ role: 'user', content: prompt }],
    });
    
    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = JSON.parse(content) as Explanation;
    
    // Validate the response
    if (!parsed.brief || !parsed.comprehensive) {
      throw new Error('Invalid response format');
    }
    
    return parsed;
  } catch (error) {
    console.error(`Error generating explanation for proposition ${propNumber}:`, error);
    throw error;
  }
}

// Save progress
function saveProgress(explanations: ExplanationsData, completed: string[]): void {
  fs.writeFileSync(PATHS.explanations, JSON.stringify(explanations, null, 2));
  fs.writeFileSync(PATHS.progress, JSON.stringify({ completed, timestamp: new Date().toISOString() }, null, 2));
}

// Main generation function
async function generateMissingExplanations(testMode = false, testCount = 5): Promise<void> {
  console.log('🚀 Starting explanation generation...');
  
  // Load data
  const { propositions, existingExplanations, missingNumbers, completed: previouslyCompleted } = loadData();
  console.log(`📊 Found ${missingNumbers.length} missing explanations`);
  if (previouslyCompleted.length > 0) {
    console.log(`📌 Resuming from previous session (${previouslyCompleted.length} already completed)`);
  }
  
  // Create backup only if not resuming
  if (previouslyCompleted.length === 0) {
    createBackup(existingExplanations);
  }
  
  // Initialize client
  const client = initializeClient();
  
  // Get examples
  const examples = getExampleExplanations(existingExplanations);
  
  // Determine which propositions to process
  const toProcess = testMode ? missingNumbers.slice(0, testCount) : missingNumbers;
  console.log(`📝 Will process ${toProcess.length} propositions${testMode ? ' (test mode)' : ''}`);
  
  // Process propositions
  const updatedExplanations = { ...existingExplanations };
  const completed: string[] = [...previouslyCompleted];
  
  for (let i = 0; i < toProcess.length; i++) {
    const propNumber = toProcess[i];
    console.log(`\n⏳ Processing proposition ${propNumber} (${i + 1}/${toProcess.length})...`);
    
    try {
      const explanation = await generateExplanation(
        client,
        propNumber,
        propositions,
        updatedExplanations,
        examples
      );
      
      updatedExplanations[propNumber] = explanation;
      completed.push(propNumber);
      console.log(`✅ Generated explanation for proposition ${propNumber}`);
      console.log(`   Brief: ${explanation.brief.substring(0, 100)}...`);
      
      // Save progress periodically
      if (completed.length % CONFIG.saveEvery === 0) {
        saveProgress(updatedExplanations, completed);
        console.log(`💾 Progress saved (${completed.length} completed)`);
      }
      
      // Rate limiting
      if (i < toProcess.length - 1) {
        console.log(`⏸️  Waiting ${CONFIG.rateLimit / 1000}s before next request...`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.rateLimit));
      }
    } catch (error) {
      console.error(`❌ Failed to generate explanation for proposition ${propNumber}`);
      console.error(error);
      
      // Save progress and continue
      saveProgress(updatedExplanations, completed);
      
      // Optional: retry logic here
    }
  }
  
  // Final save
  saveProgress(updatedExplanations, completed);
  console.log(`\n✨ Generation complete! Generated ${completed.length} explanations`);
  
  // Summary
  const stillMissing = missingNumbers.filter(n => !completed.includes(n));
  if (stillMissing.length > 0) {
    console.log(`⚠️  Still missing: ${stillMissing.join(', ')}`);
  }
}

// CLI interface
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const testMode = args.includes('--test');
  const testCount = testMode ? parseInt(args[args.indexOf('--test') + 1] || '5') : 5;
  const allMode = args.includes('--all');
  
  if (!testMode && !allMode) {
    console.log('Usage:');
    console.log('  npm run generate:explanations -- --test 5    # Test with 5 propositions');
    console.log('  npm run generate:explanations -- --all       # Generate all missing');
    return;
  }
  
  try {
    await generateMissingExplanations(testMode, testCount);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { generateMissingExplanations };