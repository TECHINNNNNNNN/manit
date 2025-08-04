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
- [ ] Replace textarea with structured form in `/src/modules/home/ui/components/project-form.tsx`
- [ ] Implement dynamic link array: platform name + URL
- [ ] Add "Add Link" button with plus icon
- [ ] Add "Remove Link" button for each link
- [ ] Implement form validation with Zod

### 2.2 Style Preferences Input
- [ ] Add free-text textarea for style description
- [ ] Add placeholder examples (e.g., "minimalist black and white", "neon cyberpunk")
- [ ] NO hardcoded style options
- [ ] Minimum character validation (10+ chars)

### 2.3 Form UI Implementation
- [ ] Implement sliding animations for add/remove links
- [ ] Create clean, intuitive interface
- [ ] Ensure mobile-responsive design
- [ ] Add proper labels and accessibility

### 2.4 Prompt Combination Logic
- [ ] Create function to merge all inputs into single AI prompt
- [ ] Format: links list + style description
- [ ] Test prompt generation with various inputs

---

## PHASE 3: API and Data Flow (Priority: MEDIUM)

### 3.1 Update TRPC Procedures
- [ ] Update input validation schema in `/src/modules/projects/server/procedures.ts`
- [ ] Handle linktree-specific data structure
- [ ] Maintain backward compatibility if needed

### 3.2 Prompt Building
- [ ] Implement prompt building logic
- [ ] Combine user inputs into formatted prompt
- [ ] Pass style preferences directly to AI
- [ ] Test with various input combinations

---

## PHASE 4: Testing & Polish (Priority: LOW)

### 4.1 Linktree Generation Testing
- [ ] Test with 1 link
- [ ] Test with 10+ links
- [ ] Test with various platform names
- [ ] Test URL validation edge cases

### 4.2 Style Testing
- [ ] Test minimalist style descriptions
- [ ] Test vibrant/colorful style descriptions
- [ ] Test professional style descriptions
- [ ] Verify AI creativity and interpretation

### 4.3 End-to-End Verification
- [ ] Test preview functionality in E2B
- [ ] Test download generated HTML
- [ ] Verify mobile responsiveness
- [ ] Check cross-browser compatibility
- [ ] Test loading states and error handling

---

## Key Milestones

- [ ] **Milestone 1**: Backend transformation complete (Phase 1)
- [ ] **Milestone 2**: Frontend form working (Phase 2)
- [ ] **Milestone 3**: Full integration tested (Phase 3)
- [ ] **Milestone 4**: Production ready (Phase 4)

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