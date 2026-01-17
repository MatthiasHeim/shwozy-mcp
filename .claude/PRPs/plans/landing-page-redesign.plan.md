# Feature: Landing Page Redesign with Modern Animations

## Summary

Transform the current basic landing page into a visually stunning, modern experience with scroll-driven animations, parallax effects, gradient backgrounds, and micro-interactions. The redesign will use CSS scroll-driven animations (native API) combined with carefully crafted keyframe animations to create an engaging, performant experience that captures the playful Shwozy brand.

## User Story

As a potential Shwozy user
I want to experience an engaging, modern landing page
So that I understand the product value and feel excited to try it

## Problem Statement

The current landing page is functional but visually basic ("vibe-coded"). It lacks the visual polish and engaging animations that would make Shwozy stand out and convey its playful, modern brand identity.

## Solution Statement

Implement a complete visual overhaul using:
1. CSS scroll-driven animations for reveal effects
2. Animated gradient backgrounds with mesh effects
3. Floating/parallax elements for depth
4. Micro-interactions on all interactive elements
5. Modern glassmorphism and card designs
6. Animated SVG waveforms and icons

---

## Metadata

| Field            | Value                                |
| ---------------- | ------------------------------------ |
| Type             | ENHANCEMENT                          |
| Complexity       | MEDIUM                               |
| Systems Affected | src/public/index.html, e2e tests     |
| Dependencies     | None (pure CSS/JS, no new libraries) |
| Estimated Tasks  | 8                                    |

---

## UX Design

### Before State

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                              CURRENT LANDING PAGE                              ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║   ┌─────────────────────────────────────────────────────────────────────┐    ║
║   │                         HERO SECTION                                 │    ║
║   │   - Static gradient background                                       │    ║
║   │   - Simple wave pattern (slow, basic)                               │    ║
║   │   - Gradient text (no animation)                                    │    ║
║   │   - Basic button hover (translateY only)                            │    ║
║   └─────────────────────────────────────────────────────────────────────┘    ║
║                                                                               ║
║   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                        ║
║   │ Feature  │ │ Feature  │ │ Feature  │ │ Feature  │  ← Static cards        ║
║   │  Card 1  │ │  Card 2  │ │  Card 3  │ │  Card 4  │    No entry animation  ║
║   └──────────┘ └──────────┘ └──────────┘ └──────────┘                        ║
║                                                                               ║
║   [1] ────► [2] ────► [3]  ← How it works (static)                           ║
║                                                                               ║
║   ┌─────────────────────────────────────────────────────────────────────┐    ║
║   │                    CONFIG GENERATOR (dark)                           │    ║
║   │   - Basic input focus                                                │    ║
║   │   - Simple copy feedback                                             │    ║
║   └─────────────────────────────────────────────────────────────────────┘    ║
║                                                                               ║
║   PAIN_POINTS:                                                                ║
║   - No scroll animations - content just appears                              ║
║   - Limited micro-interactions                                               ║
║   - Basic color transitions                                                  ║
║   - No depth or parallax effects                                             ║
║   - Icons are plain emoji, not animated                                      ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

### After State

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                              REDESIGNED LANDING PAGE                           ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║   ┌─────────────────────────────────────────────────────────────────────┐    ║
║   │                    ✨ HERO SECTION ✨                                │    ║
║   │   ┌─────────────────────────────────────────────────────────┐       │    ║
║   │   │ ANIMATED MESH GRADIENT BACKGROUND                        │       │    ║
║   │   │ - Multiple floating gradient orbs                        │       │    ║
║   │   │ - Subtle parallax on mouse move                         │       │    ║
║   │   │ - Animated waveform SVG (multi-layer)                   │       │    ║
║   │   └─────────────────────────────────────────────────────────┘       │    ║
║   │                                                                     │    ║
║   │   "Your voice, Claude's memory"  ← Animated typing/reveal           │    ║
║   │    ↑ Gradient text with shimmer animation                           │    ║
║   │                                                                     │    ║
║   │   [✨ Get Started ✨]  ← Glowing pulse + hover scale                │    ║
║   │                                                                     │    ║
║   │   ↓ Scroll indicator (bouncing chevron)                             │    ║
║   └─────────────────────────────────────────────────────────────────────┘    ║
║                                                                               ║
║   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                        ║
║   │ 🎯 Card │ │ 📋 Card │ │ ✅ Card │ │ 🔍 Card │  ← Staggered reveal      ║
║   │ GLASS   │ │ GLASS   │ │ GLASS   │ │ GLASS   │    on scroll              ║
║   │ EFFECT  │ │ EFFECT  │ │ EFFECT  │ │ EFFECT  │    + hover lift + glow    ║
║   └──────────┘ └──────────┘ └──────────┘ └──────────┘    + animated icons    ║
║       ↑ fade-in-up with 100ms stagger between cards                          ║
║                                                                               ║
║   ┌─────┐         ┌─────┐         ┌─────┐                                    ║
║   │  1  │ ═══════►│  2  │ ═══════►│  3  │  ← Animated connecting lines      ║
║   │ ○○○ │ pulse   │ ○○○ │ pulse   │ ○○○ │    Numbers count up on scroll     ║
║   └─────┘         └─────┘         └─────┘    Steps reveal sequentially       ║
║                                                                               ║
║   ┌─────────────────────────────────────────────────────────────────────┐    ║
║   │              🌙 CONFIG GENERATOR (glassmorphism)                     │    ║
║   │   ┌─────────────────────────────────────────────────────────────┐   │    ║
║   │   │ [API Key Input]  ← Glowing border on focus                  │   │    ║
║   │   │                     Shake animation on invalid              │   │    ║
║   │   └─────────────────────────────────────────────────────────────┘   │    ║
║   │   ┌─────────────────────────────────────────────────────────────┐   │    ║
║   │   │ { config JSON }  ← Syntax highlighting colors               │   │    ║
║   │   │                    Typing animation on update               │   │    ║
║   │   │                 [Copy ✨] ← Success confetti/sparkle        │   │    ║
║   │   └─────────────────────────────────────────────────────────────┘   │    ║
║   └─────────────────────────────────────────────────────────────────────┘    ║
║                                                                               ║
║   VALUE_ADD:                                                                  ║
║   - Engaging first impression (hero grabs attention)                         ║
║   - Delightful micro-interactions throughout                                 ║
║   - Scroll-driven reveals create discovery feeling                           ║
║   - Modern glassmorphism conveys quality/polish                              ║
║   - Animations respect prefers-reduced-motion                                ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

### Interaction Changes

| Location | Before | After | User Impact |
|----------|--------|-------|-------------|
| Hero background | Static gradient | Animated mesh with floating orbs | Immediate visual engagement |
| Hero text | Static gradient text | Shimmer animation + fade-in | Premium feel |
| CTA button | Simple hover lift | Glow pulse + scale + ripple | Increased click desire |
| Feature cards | Instant render | Staggered scroll-reveal + glass | Discovery delight |
| Card icons | Static emoji | Subtle bounce/pulse on hover | Playful interaction |
| How it works | Static numbers | Count-up + sequential reveal | Storytelling flow |
| Config input | Basic focus | Glowing border + validation shake | Clear feedback |
| Copy button | Text change only | Success animation + sparkle | Celebration moment |
| Scroll | Instant jumps | Smooth scroll + indicator | Guided experience |

---

## Mandatory Reading

**CRITICAL: Implementation agent MUST read these files before starting any task:**

| Priority | File | Lines | Why Read This |
|----------|------|-------|---------------|
| P0 | `src/public/index.html` | 1-642 | Current structure to enhance |
| P0 | `e2e/landing.spec.ts` | 1-117 | Tests that MUST continue passing |
| P1 | `src/server.ts` | 114-116 | Static file serving config |
| P2 | `package.json` | 14-23 | Build scripts to maintain |

**External Documentation:**

| Source | Section | Why Needed |
|--------|---------|------------|
| [CSS Scroll-Driven Animations](https://scroll-driven-animations.style/) | Full API | Native scroll animation syntax |
| [MDN animation-timeline](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline) | scroll() function | Browser support & syntax |
| [Motion.dev Best Practices](https://motion.dev/) | Performance | GPU acceleration patterns |

---

## Patterns to Mirror

**EXISTING_COLOR_VARIABLES:**
```css
/* SOURCE: src/public/index.html:11-20 */
/* PRESERVE AND EXTEND: */
:root {
  --coral: #FF6B6B;
  --soft-purple: #9B8AFF;
  --mint: #4ECDC4;
  --deep-navy: #1A1A2E;
  --cream: #FAFAF8;
  --warm-gray: #6B7280;
  --coral-light: #FFE5E5;
  --purple-light: #EDE9FF;
}
```

**EXISTING_TRANSITION_PATTERN:**
```css
/* SOURCE: src/public/index.html:101-108 */
/* EXTEND with more properties: */
.cta-button {
  transition: all 0.3s ease;
}
.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(255, 107, 107, 0.4);
}
```

**EXISTING_TEST_PATTERN:**
```typescript
/* SOURCE: e2e/landing.spec.ts:8-12 */
/* Tests to maintain: */
test("should display hero section", async ({ page }) => {
  await expect(page.locator("h1")).toContainText("Your voice, Claude's memory");
  await expect(page.locator(".hero p")).toContainText("Connect your Shwozy voice notes");
  await expect(page.locator(".cta-button")).toBeVisible();
});
```

---

## Files to Change

| File | Action | Justification |
|------|--------|---------------|
| `src/public/index.html` | UPDATE | Add animations, enhance CSS, keep HTML structure |
| `e2e/landing.spec.ts` | UPDATE | May need small selector adjustments, add animation tests |

---

## NOT Building (Scope Limits)

Explicit exclusions to prevent scope creep:

- **No React/Vue conversion** - Keep vanilla HTML/CSS/JS for simplicity
- **No external animation libraries** - Use native CSS animations only
- **No 3D WebGL effects** - Keep it performant on all devices
- **No backend changes** - Only static files
- **No new pages** - Only enhance existing landing page
- **No content changes** - Same text, just better presentation

---

## Step-by-Step Tasks

Execute in order. Each task is atomic and independently verifiable.

### Task 1: ADD CSS Variables and Animation Keyframes

- **ACTION**: Extend CSS variables and add all keyframe animations
- **IMPLEMENT**:
  - Add new color variables for gradients and glows
  - Add `@keyframes` for: fadeInUp, shimmer, float, pulse, bounce, slideIn, glow
  - Add `@media (prefers-reduced-motion: reduce)` fallbacks
- **LOCATION**: `src/public/index.html` lines 10-70 (CSS section)
- **GOTCHA**: Keep existing variables, only add new ones
- **VALIDATE**: `npm run build` - should copy to dist without errors

### Task 2: REDESIGN Hero Section with Animated Background

- **ACTION**: Transform hero into immersive animated experience
- **IMPLEMENT**:
  - Multi-layer gradient background with floating orbs
  - Enhanced SVG waveform with multiple animated paths
  - Gradient text with shimmer animation
  - Fade-in animation for hero content
  - Bouncing scroll indicator arrow
- **LOCATION**: CSS lines 41-109, HTML lines 453-459
- **MIRROR**: Keep `.hero`, `.hero-content`, `.cta-button` class names
- **GOTCHA**: Maintain h1 text "Your voice, Claude's memory" for test compatibility
- **VALIDATE**: `npm run test:e2e -- --grep "hero"` - hero tests pass

### Task 3: ADD Scroll-Driven Reveal Animations

- **ACTION**: Implement scroll-triggered animations for sections
- **IMPLEMENT**:
  - CSS `animation-timeline: view()` for scroll-linked animations
  - `.reveal` utility class for fade-in-up on scroll
  - Staggered delays for feature cards (100ms apart)
  - Sequential reveal for "how it works" steps
- **LOCATION**: CSS lines 130-200
- **PATTERN**: Use Intersection Observer as fallback for older browsers
- **GOTCHA**: Chrome 115+, Safari 17.4+ support scroll-driven animations
- **VALIDATE**: Manual scroll test + `npm run test:e2e`

### Task 4: ENHANCE Feature Cards with Glassmorphism

- **ACTION**: Upgrade feature cards to modern glass design
- **IMPLEMENT**:
  - Glassmorphism effect: `backdrop-filter: blur(10px)`
  - Subtle border with gradient
  - Hover: lift + glow + scale(1.02)
  - Icon animation on hover (subtle bounce)
  - Staggered scroll reveal using `animation-delay`
- **LOCATION**: CSS lines 137-163, HTML lines 470-491
- **MIRROR**: Keep `.feature-card` class name for test compatibility
- **GOTCHA**: Test expects exactly 4 cards with specific text
- **VALIDATE**: `npm run test:e2e -- --grep "feature"` passes

### Task 5: ANIMATE "How It Works" Section

- **ACTION**: Add engaging animations to steps flow
- **IMPLEMENT**:
  - Number circles with pulse animation
  - Animated connecting lines between steps (draw-in effect)
  - Sequential reveal: step 1 → step 2 → step 3
  - Arrow icons animate in after their step
- **LOCATION**: CSS lines 165-223, HTML lines 496-521
- **MIRROR**: Keep `.step`, `.step-number`, `.step-arrow` classes
- **GOTCHA**: Test expects 3 steps with specific titles
- **VALIDATE**: `npm run test:e2e -- --grep "steps"` passes

### Task 6: UPGRADE Config Generator with Micro-interactions

- **ACTION**: Add delightful interactions to setup section
- **IMPLEMENT**:
  - Glassmorphism on config container
  - Input: glowing border on focus, subtle shake on invalid
  - Config output: syntax-like coloring for JSON keys
  - Copy button: success animation with checkmark morph
  - Sparkle/confetti effect on successful copy
- **LOCATION**: CSS lines 286-368, HTML lines 550-571, JS lines 598-640
- **MIRROR**: Keep `#apiKey`, `#configOutput`, `.copy-button` IDs/classes
- **GOTCHA**: Test interacts with these elements - IDs must stay same
- **VALIDATE**: `npm run test:e2e -- --grep "config"` passes

### Task 7: ADD Smooth Scroll and Polish

- **ACTION**: Final polish and smooth scroll behavior
- **IMPLEMENT**:
  - `scroll-behavior: smooth` on html
  - Scroll indicator in hero (bouncing chevron)
  - Footer links hover animations
  - Store badges subtle hover effect
  - Global transition smoothing
- **LOCATION**: CSS various sections
- **GOTCHA**: Footer test expects "GitHub", "Privacy Policy", "Contact" text
- **VALIDATE**: Full `npm run test:e2e` suite passes

### Task 8: UPDATE E2E Tests for Animation States

- **ACTION**: Ensure tests work with animations
- **IMPLEMENT**:
  - Add `await page.waitForTimeout(500)` where needed for animations
  - Test reduced-motion preference behavior
  - Verify all existing selectors still work
- **LOCATION**: `e2e/landing.spec.ts`
- **GOTCHA**: Don't change test assertions, only add waits if needed
- **VALIDATE**: `npm run test:e2e` - all 20 tests pass

---

## Animation Specifications

### Keyframes Reference

```css
/* Fade in from below */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Shimmer effect for text */
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

/* Floating effect for orbs */
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

/* Pulse glow */
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.4); }
  50% { box-shadow: 0 0 0 15px rgba(255, 107, 107, 0); }
}

/* Bounce for scroll indicator */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(10px); }
}

/* Scale in */
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
```

### Timing Guidelines

| Element | Duration | Easing | Delay Pattern |
|---------|----------|--------|---------------|
| Hero content | 0.8s | ease-out | 0s |
| Feature cards | 0.6s | ease-out | 0, 0.1s, 0.2s, 0.3s |
| Steps | 0.5s | ease-out | 0, 0.2s, 0.4s |
| Hover effects | 0.3s | ease | - |
| Scroll reveals | 0.6s | ease-out | - |

---

## Testing Strategy

### E2E Tests to Maintain

| Test Case | Selector | Must Still Work |
|-----------|----------|-----------------|
| Hero h1 | `page.locator("h1")` | Text unchanged |
| Hero p | `page.locator(".hero p")` | Text unchanged |
| CTA button | `.cta-button` | Visible, clickable |
| Feature cards | `.feature-card` | Count = 4, text unchanged |
| Steps | `.step` | Count = 3, text unchanged |
| Config input | `#apiKey` | Fillable |
| Config output | `#configOutput` | Updates on input |
| Copy button | `.copy-button` | Clickable, shows "Copied!" |
| Store badges | `.store-badge` | Count = 2 |
| Footer | `footer` | Contains expected links |
| Health endpoint | `/health` | Returns JSON |

### Edge Cases Checklist

- [ ] `prefers-reduced-motion: reduce` disables animations
- [ ] All animations complete within 1s (no infinite blocking)
- [ ] Touch devices: hover states don't stick
- [ ] Safari: backdrop-filter fallback
- [ ] Mobile 375px: all content visible, no overflow

---

## Validation Commands

### Level 1: STATIC_ANALYSIS

```bash
npm run build
```

**EXPECT**: Exit 0, dist/public/index.html created

### Level 2: UNIT_TESTS

```bash
npm test
```

**EXPECT**: 13/13 unit tests pass (unaffected by CSS changes)

### Level 3: E2E_TESTS

```bash
npm run test:e2e
```

**EXPECT**: 20/20 E2E tests pass

### Level 4: VISUAL_VALIDATION

Manual check:
- [ ] Hero animations play on load
- [ ] Scroll reveals trigger correctly
- [ ] Hover states feel responsive
- [ ] Mobile layout intact
- [ ] No layout shift during animations

### Level 5: PERFORMANCE_VALIDATION

```bash
# Run Lighthouse in Chrome DevTools
# Performance score should remain > 90
```

---

## Acceptance Criteria

- [ ] All 20 E2E tests pass without modification to assertions
- [ ] Hero section has animated gradient background
- [ ] Feature cards reveal on scroll with stagger
- [ ] "How it works" steps animate sequentially
- [ ] Config generator has glowing focus and copy feedback
- [ ] Smooth scroll between sections
- [ ] `prefers-reduced-motion` respected
- [ ] Mobile responsive maintained
- [ ] No external dependencies added
- [ ] Build process unchanged

---

## Completion Checklist

- [x] Task 1: CSS variables and keyframes added
- [x] Task 2: Hero section animated
- [x] Task 3: Scroll-driven reveals working
- [x] Task 4: Feature cards glassmorphism + animation
- [x] Task 5: Steps section animated
- [x] Task 6: Config generator enhanced
- [x] Task 7: Polish and smooth scroll added
- [x] Task 8: E2E tests verified
- [x] Level 1: Build passes
- [x] Level 2: Unit tests pass (13/13)
- [x] Level 3: E2E tests pass (20/20)
- [ ] Level 4: Visual validation complete (manual verification needed)
- [x] All acceptance criteria met

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| E2E tests break due to timing | MEDIUM | HIGH | Add strategic waits, use `waitForSelector` |
| Safari backdrop-filter issues | LOW | MEDIUM | Provide solid color fallback |
| Scroll animations not supported | LOW | LOW | Intersection Observer fallback |
| Performance degradation | LOW | MEDIUM | Use transform/opacity only, test on mobile |
| Over-animation causing distraction | MEDIUM | MEDIUM | Keep animations subtle, <1s duration |

---

## Notes

### Design Philosophy
- **Playful but professional**: Animations should delight, not distract
- **Performance first**: GPU-accelerated properties only (transform, opacity)
- **Accessibility**: Respect motion preferences, maintain contrast
- **Progressive enhancement**: Works without JS, enhanced with it

### Color Enhancement Ideas
Consider adding these accent colors for gradients:
- `--coral-glow: rgba(255, 107, 107, 0.3)` - for glows
- `--purple-glow: rgba(155, 138, 255, 0.3)` - for glows
- `--gradient-start: #FF6B6B` - coral
- `--gradient-end: #9B8AFF` - purple

### Animation Inspiration
- Stripe's landing page (subtle parallax)
- Linear's website (smooth reveals)
- Vercel's homepage (gradient backgrounds)
