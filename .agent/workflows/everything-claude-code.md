---
description: Everything Claude Code (ECC) — The Universal Development Orchestrator 
---

This workflow implements the 6-phase collaborative development cycle from Everything Claude Code (ECC).

1. **Research & Analysis**
   - Goal: Understand requirements and gather technical context.
   - Requirements Score (0-10): Must be ≥7 to proceed.
   - Outputs: Enhanced prompt, dependency analysis, and risk assessment.

2. **Solution Ideation**
   - Goal: Compare multiple implementation strategies.
   - Process: Generate at least 2 architectural options (e.g. "Minimal & Stable" vs "Scalable & Modern").
   - Outputs: Trade-off matrix and recommended approach.

3. **Detailed Planning (ROADMAP integration)**
   - Goal: Decompose the selected solution into executable phases.
   - Process: Update `.gsd/ROADMAP.md` with new phases or update existing ones.
   - Outputs: Approved implementation plan with clear sub-tasks.

4. **Implementation (Execution)**
   - Goal: Write the code according to the plan.
   - Rules: Follow project style guides, use semantic commits, and update tests in parallel.
   - Outputs: Pull request / branch with the completed feature.

5. **Code Optimization**
   - Goal: Refactor for performance, security, and readability.
   - Focus: Error handling, logging, and type safety.
   - Outputs: Optimized codebase.

6. **Quality Review (Verification)**
   - Goal: Validate the work against the original requirements.
   - Process: Run tests, check UI consistency, and verify documentation updates.
   - Outputs: Final verification report.

---

### Usage
Run this workflow by typing:
`/ecc "your task description here"`

### Rollout
// turbo
1. Install ECC Rules
```powershell
# Ensure ECC is accessible
if (!(Test-Path -Path "c:\tmp\ecc")) {
    git clone https://github.com/affaan-m/everything-claude-code.git c:\tmp\ecc
}
# Install rules to project
.\install.ps1 --target antigravity typescript
```
