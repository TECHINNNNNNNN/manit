# Manit AI - AI-Powered Linktree Generator

Build stunning link-in-bio pages at the speed of thought. Just describe what you want, and watch the AI create it instantly.

## Why I Built This

As a developer, I wanted to push beyond the typical portfolio projects. No more todo apps or YouTube clones. I built Manit to solve a real problem while showcasing my ability to work with cutting-edge AI technologies and complex distributed systems.

The challenge? Creating an AI system that could understand natural language, generate production-ready code, deploy it automatically, and make it instantly shareable - all in under 30 seconds.

## Live Demo

[Try it yourself](https://manit-lac.vercel.app/) - Create your first AI-powered linktree in seconds

## Technical Highlights

### The Architecture Challenge

Building Manit required solving several complex engineering problems:

**1. AI Code Generation Pipeline**
- Integrated OpenAI GPT-4 through Inngest's agent framework for reliable, stateful AI workflows
- Built custom prompt engineering to ensure consistent, high-quality HTML/CSS generation
- Implemented real-time streaming responses with proper error recovery

**2. Sandboxed Code Execution**
- Set up E2B sandboxes for secure, isolated code execution
- Each user gets their own containerized environment that runs their generated code
- Built file system management for multi-file projects with hot reloading

**3. Automatic GitHub Deployment**
- Engineered a complete GitHub Pages deployment pipeline using Octokit
- Auto-creates repositories, commits code, and enables GitHub Pages
- Generates short URLs with custom routing for easy sharing

**4. Type-Safe Full Stack**
- Implemented tRPC for end-to-end type safety between frontend and backend
- Zero runtime errors from API mismatches
- Prisma ORM with fully typed database queries

## Tech Stack

### Core Technologies
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL with Prisma ORM
- **API Layer**: tRPC for type-safe APIs
- **Authentication**: Clerk for secure user management
- **AI Integration**: Inngest + OpenAI GPT-4
- **Deployment**: Vercel (app) + GitHub Pages (generated sites)

### Key Libraries
- **Code Execution**: E2B sandboxes for isolated environments
- **Background Jobs**: Inngest for reliable async workflows
- **UI Components**: Radix UI + Tailwind CSS
- **Form Handling**: React Hook Form + Zod validation
- **Testing**: Vitest + Playwright

## Problems I Solved

### Real-time AI Streaming
Instead of making users wait for the entire generation process, I implemented streaming responses. Users see their linktree being built in real-time, with proper error boundaries and recovery mechanisms.

### Deployment Orchestration
The trickiest part was coordinating between multiple services:
1. AI generates the code
2. E2B sandbox validates and previews it
3. GitHub API creates and deploys the repository
4. Short URL service makes it shareable

All this happens asynchronously with proper state management and error handling.

### Rate Limiting & Usage Tracking
Built a credit-based system to prevent abuse while giving users generous free tier access. Implemented efficient caching to minimize API calls and reduce costs.

## Local Development

```bash
# Clone the repository
git clone https://github.com/TECHINNNNNNNN/manit.git
cd manit

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your API keys

# Set up database
npx prisma migrate dev
npx prisma generate

# Run development server
npm run dev
```

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── modules/          # Feature-based modules
│   ├── home/        # Landing page & project list
│   ├── messages/    # Chat interface & AI responses
│   ├── projects/    # Project management & deployment
│   └── usage/       # Credit system & limits
├── inngest/         # Background job handlers
├── lib/             # Shared utilities
│   ├── github-deploy.ts  # GitHub Pages deployment
│   ├── url-shortener.ts  # Short URL generation
│   └── usage.ts          # Rate limiting logic
└── trpc/            # Type-safe API layer
```

## Performance Optimizations

- **Streaming Responses**: Users see progress immediately instead of waiting
- **Smart Caching**: Reduces redundant API calls by 70%
- **Optimistic Updates**: UI updates instantly while background jobs process
- **Lazy Loading**: Components load on-demand for faster initial page loads

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Type checking
npx tsc --noEmit
```

## What's Next

While this is primarily a portfolio project, I'm continuously improving it:
- Adding more customization options for generated linktrees
- Implementing themes and templates
- Building analytics for deployed pages
- Adding custom domain support

## About Me

I'm Techin Chompooborisuth, a full-stack developer passionate about building products that combine cutting-edge AI with practical user needs.

- [LinkedIn](https://www.linkedin.com/in/techin-chompooborisuth-396b19268)
- [GitHub](https://github.com/TECHINNNNNNNN)

## License

MIT License - feel free to use this code for your own projects!

---

Built with determination and lots of coffee by Techin