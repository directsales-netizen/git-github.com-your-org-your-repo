# Premium TechNoir — Quick Reference Guide

**Bookmark this file. Reference it every single day.**

---

## 🚀 I Want to Start Working. Where Do I Go?

1. **First time ever?** → Read [README_BIBLE.md](./README_BIBLE.md) (15 min)
2. **Know the context?** → Go to [docs/VOLUME_4_PROMPT_LIBRARY.md](./docs/VOLUME_4_PROMPT_LIBRARY.md)
3. **Find your phase** → Look for "Prompt #[X]"
4. **Copy the prompt** → Give to Claude with context
5. **Verify acceptance criteria** → Check every box before moving on

---

## 📍 Quick Navigation

### The Essentials
| Need | File | Read Time |
|------|------|-----------|
| **Overview** | [README_BIBLE.md](./README_BIBLE.md) | 15 min |
| **Master Index** | [BIBLE.md](./BIBLE.md) | 5 min |
| **Company Context** | [docs/VOLUME_1_COMPANY_FOUNDATION.md](./docs/VOLUME_1_COMPANY_FOUNDATION.md) | 20 min |
| **Dev Standards** | [docs/VOLUME_2_CLAUDE_MASTER_INSTRUCTION.md](./docs/VOLUME_2_CLAUDE_MASTER_INSTRUCTION.md) | 25 min |
| **Build Prompts** | [docs/VOLUME_4_PROMPT_LIBRARY.md](./docs/VOLUME_4_PROMPT_LIBRARY.md) | 30 min |

### Design System
| Need | File | Use For |
|------|------|---------|
| **Colors & Tokens** | [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Color decisions, spacing, shadows |
| **Fonts & Text** | [TYPOGRAPHY.md](./TYPOGRAPHY.md) | Font sizes, hierarchy, line heights |
| **Visual Standards** | [VISUAL_BRAND_GUIDELINES.md](./VISUAL_BRAND_GUIDELINES.md) | Logo, brand look, imagery |
| **UI Patterns** | [COMPONENT_GUIDELINES.md](./COMPONENT_GUIDELINES.md) | Button styles, form patterns |
| **Code Integration** | [src/design/](./src/design/) | Import tokens, utilities, CSS |

### Specialized Topics
| Topic | File |
|-------|------|
| AI Assistant | [AI_ASSISTANT_SPECS.md](./AI_ASSISTANT_SPECS.md) |
| Marketing | [CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md) |
| Product Strategy | [PRD.md](./PRD.md) |
| Roadmap | [ROADMAP.md](./ROADMAP.md) |

---

## 🎯 Finding What You Need (By Question)

### "What should I build next?"
→ Open [docs/VOLUME_4_PROMPT_LIBRARY.md](./docs/VOLUME_4_PROMPT_LIBRARY.md)
→ Find next prompt in sequence
→ Copy prompt text exactly

### "What colors can I use?"
→ Open [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
→ Look at "Color Palette" section
→ Use provided hex codes, no hardcoding

### "How big should this heading be?"
→ Open [TYPOGRAPHY.md](./TYPOGRAPHY.md)
→ Look at "Complete Type Scale"
→ Use exact size provided (e.g., H2 = 36px)

### "What's our mission again?"
→ Open [docs/VOLUME_1_COMPANY_FOUNDATION.md](./docs/VOLUME_1_COMPANY_FOUNDATION.md)
→ See "Mission & Vision" section

### "What's the coding standard for [X]?"
→ Open [docs/VOLUME_2_CLAUDE_MASTER_INSTRUCTION.md](./docs/VOLUME_2_CLAUDE_MASTER_INSTRUCTION.md)
→ Find section for [X]
→ Example: "Coding Standards" → "TypeScript"

### "Is this accessible?"
→ Check WCAG 2.1 AA checklist in [VISUAL_BRAND_GUIDELINES.md](./VISUAL_BRAND_GUIDELINES.md)
→ Verify color contrast (4.5:1)
→ Test keyboard navigation
→ Test with screen reader

### "What's the file organization?"
→ Open [docs/VOLUME_2_CLAUDE_MASTER_INSTRUCTION.md](./docs/VOLUME_2_CLAUDE_MASTER_INSTRUCTION.md)
→ See "File Organization" section

### "How do I test this?"
→ Open [docs/VOLUME_2_CLAUDE_MASTER_INSTRUCTION.md](./docs/VOLUME_2_CLAUDE_MASTER_INSTRUCTION.md)
→ See "Testing Strategy" section

### "What's the security requirement?"
→ Open [docs/VOLUME_2_CLAUDE_MASTER_INSTRUCTION.md](./docs/VOLUME_2_CLAUDE_MASTER_INSTRUCTION.md)
→ See "Security & Compliance" section

### "How do I work with Claude?"
→ Read [README_BIBLE.md](./README_BIBLE.md) section "Working with Claude"
→ Provide full context
→ Include acceptance criteria
→ Reference the Bible

---

## 📋 The 10 Volumes (Status)

| Volume | File | Status |
|--------|------|--------|
| **1** | Company Foundation | ✅ COMPLETE |
| **2** | Master Instruction | ✅ COMPLETE |
| **3** | Product Requirements | 📋 Templated |
| **4** | Prompt Library | ✅ COMPLETE (Phase 2) |
| **5** | Design System | ✅ Complete (in code) |
| **6** | AI Assistant Manual | 📋 Templated |
| **7** | Inventory System | 📋 Templated |
| **8** | Marketing System | 📋 Templated |
| **9** | Deployment | 📋 Templated |
| **10** | Future Expansion | 📋 Templated |

---

## 🔗 Design System Files (Location)

```
src/design/
├── tokens.ts          ← TypeScript design tokens (colors, typography, spacing)
├── utilities.ts       ← Tailwind utilities and component presets
├── globals.css        ← CSS variables for all design tokens
├── index.ts           ← Main export (use this for imports)
└── README.md          ← Developer guide for design system
```

**Import in your components:**
```typescript
import { buttonVariants, colors, typography, cn } from '@/design'
```

---

## 📚 Development Phases

### Phase 2: UI/UX (Next → Start Here)
**Prompts 13-25 | 4-6 weeks | 13 features**
- Prompt 13: Homepage
- Prompt 14: Navigation
- Prompt 15: Footer
- Prompt 16: Shop Page
- Prompt 17: Collections
- Prompt 18: Product Detail
- Prompt 19: Search
- Prompt 20: Shopping Cart
- Prompt 21: Checkout
- Prompt 22: Customer Dashboard
- Prompt 23: Wishlist
- Prompt 24: Order History
- Prompt 25: Loyalty Dashboard

### Phase 3: Inventory
**Prompts 26-32 | 3-4 weeks | Database + CRUD**

### Phase 4: AI Assistant
**Prompts 33-37 | 2-3 weeks | ChatBot Integration**

### Phases 5-11
Continue through deployment and expansion

---

## ✅ Quality Checklist (Print This)

Before you say "done," verify:

- [ ] **Acceptance criteria:** All boxes checked
- [ ] **Tests:** Unit tests pass, E2E tests pass
- [ ] **Design system:** All colors/spacing from system
- [ ] **Accessibility:** WCAG 2.1 AA (test keyboard nav + screen reader)
- [ ] **Performance:** Lighthouse > 90
- [ ] **Responsive:** Works at 375px, 768px, 1024px, 1440px
- [ ] **Documentation:** Code commented, complex decisions explained
- [ ] **Security:** No secrets in code, input validation present
- [ ] **No console errors:** Check browser console

---

## 🤖 How to Give a Task to Claude

### Template (Copy & Customize)

```
Here's your task:

**Prompt:** [Copy entire prompt from VOLUME_4]

**Context:**
- Company: Premium TechNoir (refurbished tech)
- See business context: docs/VOLUME_1_COMPANY_FOUNDATION.md
- Follow all standards: docs/VOLUME_2_CLAUDE_MASTER_INSTRUCTION.md

**Design System:**
- Colors: DESIGN_SYSTEM.md
- Typography: TYPOGRAPHY.md
- Components: COMPONENT_GUIDELINES.md
- Code: src/design/

**Reference Previous Work:**
- Navigation component: [path]
- Product card: [path]
- [other relevant files]

**Quality Requirements:**
- Lighthouse > 90
- WCAG 2.1 AA compliance
- No hardcoded colors/spacing (use design system)
- Unit tests + integration tests
- TypeScript strict mode
- Follow code organization from Volume 2

**Complete when all acceptance criteria met:**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] etc.

Go build something great! ✨
```

---

## 🚨 Common Mistakes to Avoid

❌ **Don't:** Hardcode colors like `#FF5500`  
✅ **Do:** Use `colors.primary` or Tailwind `bg-aqua-500`

❌ **Don't:** Create random spacing like `margin: 23px`  
✅ **Do:** Use grid like `m-6` (8px × 6 = 48px)

❌ **Don't:** Make button sizes/styles unique  
✅ **Do:** Use `buttonVariants.primary` from utilities

❌ **Don't:** Skip tests  
✅ **Do:** Write unit tests, integration tests, E2E tests

❌ **Don't:** Commit secrets or API keys  
✅ **Do:** Use environment variables only

❌ **Don't:** Skip accessibility  
✅ **Do:** Test keyboard nav, ARIA labels, color contrast

❌ **Don't:** Assume you know the business need  
✅ **Do:** Read Volume 1 first

❌ **Don't:** Paraphrase prompts  
✅ **Do:** Copy prompt text exactly, with context

---

## 📊 File Organization at a Glance

```
Premium-TechNoir/
├── README_BIBLE.md              ← START: Complete getting started guide
├── BIBLE.md                     ← Master index of all volumes
├── BIBLE_STATUS.md              ← This status report
├── QUICK_REFERENCE.md           ← You are reading this
│
├── docs/
│   ├── VOLUME_1_COMPANY_FOUNDATION.md        ✅
│   ├── VOLUME_2_CLAUDE_MASTER_INSTRUCTION.md ✅
│   ├── VOLUME_4_PROMPT_LIBRARY.md            ✅
│   └── VOLUME_[3,5-10].md                    📋 (To create)
│
├── Design System (Root)
│   ├── DESIGN_SYSTEM.md
│   ├── TYPOGRAPHY.md
│   ├── VISUAL_BRAND_GUIDELINES.md
│   ├── COMPONENT_GUIDELINES.md
│   └── DESIGN_SYSTEM_IMPLEMENTATION.md
│
├── src/design/                  ← Actual implementation
│   ├── tokens.ts                ← Use these!
│   ├── utilities.ts
│   ├── globals.css
│   ├── index.ts
│   └── README.md
│
└── Other docs
    ├── CLAUDE.md
    ├── AI_ASSISTANT_SPECS.md
    ├── CONTENT_STRATEGY.md
    └── etc.
```

---

## 🎓 5-Minute Onboarding

**For someone completely new:**

1. **Read this file** (5 min) ← You're doing this now
2. **Read [README_BIBLE.md](./README_BIBLE.md)** (10 min)
3. **Skim [docs/VOLUME_1_COMPANY_FOUNDATION.md](./docs/VOLUME_1_COMPANY_FOUNDATION.md)** (5 min)
4. **Skim [docs/VOLUME_2_CLAUDE_MASTER_INSTRUCTION.md](./docs/VOLUME_2_CLAUDE_MASTER_INSTRUCTION.md)** (5 min)
5. **Reference DESIGN_SYSTEM.md as needed** (ongoing)

**Total:** 25 minutes to be 80% ready to code

---

## 🔄 Development Workflow (Daily)

### Every Day You Work

1. **Morning:** Open [docs/VOLUME_2_CLAUDE_MASTER_INSTRUCTION.md](./docs/VOLUME_2_CLAUDE_MASTER_INSTRUCTION.md) (reference)
2. **Task:** Go to [docs/VOLUME_4_PROMPT_LIBRARY.md](./docs/VOLUME_4_PROMPT_LIBRARY.md) (find your prompt)
3. **Design:** Reference [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) + [TYPOGRAPHY.md](./TYPOGRAPHY.md)
4. **Code:** Follow standards from Volume 2
5. **Test:** Run tests, check Lighthouse, verify accessibility
6. **Verify:** Go through acceptance criteria checklist
7. **Next:** Move to next prompt in sequence

---

## 🎯 Key Principles (Remember These)

1. **Context is Everything** – Always include business context
2. **Standards are Non-Negotiable** – Always follow Volume 2
3. **Design System is Source of Truth** – Never hardcode values
4. **Acceptance Criteria are Verifiable** – Every feature has a checklist
5. **Sustainability Matters** – Write maintainable, scalable code
6. **Accessibility is Built-In** – WCAG 2.1 AA minimum, always
7. **Security First** – Validate everything, never hardcode secrets
8. **Tests Verify Behavior** – Write tests before code (TDD)
9. **Documentation Matters** – Comment the why, not the what
10. **Quality Over Speed** – Ship code you're proud of

---

## 📞 FAQ

**Q: I want to start Phase 2. What's the first thing I do?**  
A: Go to [docs/VOLUME_4_PROMPT_LIBRARY.md](./docs/VOLUME_4_PROMPT_LIBRARY.md) and find Prompt 13.

**Q: Do I need to read all 10 volumes?**  
A: No. Read Volumes 1-2 once. Then reference as needed.

**Q: Can I skip a phase?**  
A: No. Each phase builds on the previous one.

**Q: What if I find a mistake in the Bible?**  
A: Fix it and update the document. It's a living guide.

**Q: How often should I check the Bible?**  
A: Every single day when you work.

**Q: What if the business changes?**  
A: Update Volume 1. Everything else still applies.

---

## 🌟 You're Ready!

Everything you need to build Premium TechNoir professionally is in this Bible.

**Next step:** Pick a prompt from [docs/VOLUME_4_PROMPT_LIBRARY.md](./docs/VOLUME_4_PROMPT_LIBRARY.md) and start building.

**Let's go.** 🚀

---

**Premium TechNoir Development Bible**  
**Quick Reference v1.0**  
**Last Updated:** 2026-07-04
