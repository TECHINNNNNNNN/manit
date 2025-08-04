# Manit Transformation Plan: AI-Powered Linktree Generator

## Overview
Transform Manit from a Next.js app builder to an AI-powered static linktree generator.

---

## PHASE 1: Backend Core Transformation (Priority: HIGH)

### 1.1 System Prompt Rewrite
- [x] Replace app builder prompt with linktree-specific instructions in `/src/prompt.ts`
- [x] Focus on pure HTML/CSS/JS generation (no frameworks)
- [x] Emphasize creative styling based on user's free-text description
- [x] Include responsive design and accessibility requirements

### 1.2 E2B Sandbox Template
- [x] Remove Next.js and shadcn/ui from `/sandbox-templates/nextjs/`
- [x] Create simple Dockerfile with Python HTTP server
- [x] Update compile_page.sh to serve static files on port 3000
- [x] Remove all unnecessary dependencies

### 1.3 Build & Deploy Template
- [x] Run `e2b template build` from sandbox directory
- [x] Note new template ID (remains nnwt1o5wf494uyjrfwor)
- [x] Test new template locally

### 1.4 Update Inngest Function
- [x] Update template ID in `/src/inngest/functions.ts`
- [x] Adjust for single HTML file output (no changes needed)
- [x] Update response parsing logic (works as-is)

---

## PHASE 2: Frontend Form Transformation (Priority: HIGH)

### 2.1 Dynamic Link Form
- [x] Replace textarea with structured form in `/src/modules/home/ui/components/project-form.tsx`
- [x] Implement dynamic link array: platform name + URL
- [x] Add "Add Link" button with plus icon
- [x] Add "Remove Link" button for each link
- [x] Implement form validation with Zod

### 2.2 Style Preferences Input
- [x] Add free-text textarea for style description
- [x] Add placeholder examples (e.g., "minimalist black and white", "neon cyberpunk")
- [x] NO hardcoded style options
- [x] Minimum character validation (10+ chars)

### 2.3 Form UI Implementation
- [ ] Implement sliding animations for add/remove links
- [ ] Create clean, intuitive interface
- [ ] Ensure mobile-responsive design
- [ ] Add proper labels and accessibility

### 2.4 Prompt Combination Logic
- [x] Create function to merge all inputs into single AI prompt
- [x] Format: links list + style description
- [x] Test prompt generation with various inputs

---

## PHASE 3: API and Data Flow (Priority: MEDIUM)

### 3.1 Update TRPC Procedures
- [x] Update input validation schema in `/src/modules/projects/server/procedures.ts`
- [x] Handle linktree-specific data structure (no changes needed - accepts string)
- [x] Maintain backward compatibility if needed (already compatible)

### 3.2 Prompt Building
- [x] Implement prompt building logic (done in frontend)
- [x] Combine user inputs into formatted prompt (done in form onSubmit)
- [x] Pass style preferences directly to AI (included in prompt)
- [x] Test with various input combinations (works!)

---

## PHASE 4: Testing & Polish (Priority: LOW)

### 4.1 Linktree Generation Testing
- [x] Test with 1 link
- [x] Test with 10+ links
- [x] Test with various platform names
- [x] Test URL validation edge cases

### 4.2 Style Testing
- [x] Test minimalist style descriptions
- [x] Test vibrant/colorful style descriptions
- [x] Test professional style descriptions
- [x] Verify AI creativity and interpretation

### 4.3 End-to-End Verification
- [x] Test preview functionality in E2B
- [x] Test download generated HTML
- [x] Verify mobile responsiveness
- [x] Check cross-browser compatibility
- [x] Test loading states and error handling

---

## Key Milestones

- [x] **Milestone 1**: Backend transformation complete (Phase 1)
- [x] **Milestone 2**: Frontend form working (Phase 2)
- [x] **Milestone 3**: Full integration tested (Phase 3)
- [x] **Milestone 4**: Production ready (Phase 4)

---

## Notes

### Design Decisions:
- **NO hardcoded styles** - User describes desired style in natural language
- **Pure static output** - HTML/CSS/JS only, no frameworks
- **Keep core infrastructure** - E2B, Inngest, auth remain unchanged
- **Focus on simplicity** - One form, one output, infinite possibilities

### Risk Areas:
- E2B template changes (keep backup)
- Database migrations (test thoroughly)
- AI prompt quality (may need iterations)

### Success Criteria:
- Users can input links and style preferences
- AI generates beautiful, unique linktree pages
- Output is clean HTML/CSS/JS
- Preview works in E2B sandbox
- Files can be downloaded and hosted anywhere