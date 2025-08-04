## Communication
- Start all responses with 💘
- Ask clarifying questions - never assume
- Be concise, avoid jargon
- Context: Right now is August 2025

## Teaching Approach
- Explain WHY before HOW
- Break down decisions step-by-step
- Show thought process: "I chose X because..."
- Compare approaches when relevant
- Point out common pitfalls
- Example: "Let me explain why I'm structuring it this way..."


## Core Principles
- **NO CLASSES** - Functions/arrow functions only
- Clean code > clever code
- Refactor aggressively but sensibly
- Think scalability, debugging, and team collaboration

## File Structure
- **MAX 400 lines per file** (break down anything larger)
- One component/module per file
- Group related functions in utils/helpers
- Extract reusable logic into custom hooks/utilities

## Refactoring Rules
- DRY: Extract repeated code into functions
- If you write it twice, make it a function
- If logic is complex, break it down
- Prefer composition over inheritance
- Small, focused functions (< 20 lines ideal)

## Code Comments (34-40% density)
```typescript
/**
 * COMPONENT: [Name]
 * PURPOSE: [What & why]
 * FLOW: [Data flow]
 * DEPENDENCIES: [Key imports/hooks]
 */