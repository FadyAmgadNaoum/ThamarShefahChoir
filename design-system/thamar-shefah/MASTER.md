# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Thamar Shefah
**Generated:** 2026-09-21 14:57:15
**Category:** Church/Religious Organization

---

## Global Rules

### Color Palette (Extracted from Choir Logo)

| Role | Hex | CSS Variable | Description / Reference |
|------|-----|--------------|-------------------------|
| Primary | `#640810` | `--color-primary` | Main calligraphy "ثمر شفاه" Deep Burgundy |
| Primary Dark | `#4A070D` | `--color-primary-dark` | Deep contrast Burgundy for hero/headings |
| Primary Hover | `#7A0C16` | `--color-primary-hover` | Interactive hover burgundy |
| On Primary | `#FFFFFF` | `--color-on-primary` | High contrast white text |
| Secondary / Accent | `#DCA40C` | `--color-secondary` | Cross, Harp & Notes Radiant Gold |
| Accent Dark | `#B88008` | `--color-accent-dark` | Deep gold border / focus rings |
| Accent Light | `#FDF8E8` | `--color-accent-light` | Soft gold glow, badge background |
| On Accent/CTA | `#FFFFFF` | `--color-on-accent` | Button text |
| Background | `#FDFBF7` | `--color-background` | Warm ivory canvas background |
| Foreground | `#1C1917` | `--color-foreground` | Deep charcoal for "ذبيحة تسبيح" body text |
| Card | `#FFFFFF` | `--color-card` | Clean elevated card surfaces |
| Card Foreground | `#1C1917` | `--color-card-foreground` | High contrast card text |
| Muted | `#F5F1EB` | `--color-muted` | Neutral warm muted backgrounds |
| Muted Foreground | `#78716C` | `--color-muted-foreground` | Subtitles, metadata |
| Border | `#EADBB6` | `--color-border` | Subtle warm gold-tinted divider |
| Destructive | `#DC2626` | `--color-destructive` | Absent / Alert status |
| On Destructive | `#FFFFFF` | `--color-on-destructive` | Alert text |
| Ring | `#DCA40C` | `--color-ring` | Gold focus ring (3px, accessible) |

**Color Notes:** Exact match to the choir logo `669335214_1469315354777002_4051959534152423696_n.jpg` (Burgundy `#640810`, Gold `#DCA40C`, Warm Cream `#FDFBF7`, Onyx `#1C1917`).

### Typography

- **Heading Font:** Inter
- **Body Font:** Playfair Display
- **Mood:** bold typography, editorial, poster, near-black, vermillion, luxury, type-as-hero, manifesto, high-contrast
- **Google Fonts:** [Inter + Playfair Display](https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400&family=Playfair+Display:ital@1)

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400&family=Playfair+Display:ital@1&display=swap');
```

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: #640810;
  color: #FFFFFF;
  padding: 12px 24px;
  border-radius: 9999px;
  font-weight: 600;
  box-shadow: 0 4px 14px rgba(100, 8, 16, 0.25);
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-primary:hover {
  background: #7A0C16;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(100, 8, 16, 0.35);
}

/* Secondary / Gold Accent Button */
.btn-secondary {
  background: #DCA40C;
  color: #FFFFFF;
  padding: 12px 24px;
  border-radius: 9999px;
  font-weight: 600;
  box-shadow: 0 4px 14px rgba(220, 164, 12, 0.25);
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #B88008;
  transform: translateY(-1px);
}

/* Outline Button */
.btn-outline {
  background: transparent;
  color: #640810;
  border: 2px solid #640810;
  padding: 12px 24px;
  border-radius: 9999px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-outline:hover {
  background: #FDFBF7;
  border-color: #DCA40C;
  color: #DCA40C;
}
```

### Cards

```css
.card {
  background: #FAF5FF;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
  cursor: pointer;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: #7C3AED;
  outline: none;
  box-shadow: 0 0 0 3px #7C3AED20;
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Accessible & Ethical

**Keywords:** Accessible, inclusive interface, high contrast, large text (16px+), keyboard navigation, screen reader friendly, accessibility standards aware, focus state, semantic

**Best For:** Government, healthcare, education, inclusive products, large audience, legal compliance, public

**Key Effects:** Clear focus rings (3-4px), ARIA labels, skip links, responsive design, reduced motion, 44x44px touch targets

### Page Pattern

**Pattern Name:** Hero + Testimonials + CTA

- **Conversion Strategy:** Social proof before CTA. Use a concise set of verified testimonials with photo, name, and role. CTA after social proof. Provide previous/next and pause controls; stop rotation on focus, hover, and reduced motion; announce slide position. Previous/next buttons and keyboard controls must expose every slide without dragging.
- **CTA Placement:** Hero (sticky) + Post-testimonials
- **Section Order:** Hero > Problem statement > Solution overview > Testimonials carousel > CTA

---

## Anti-Patterns (Do NOT Use)

- ❌ Outdated design
- ❌ Hidden info

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
