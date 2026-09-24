# Landing Page Overrides

> **PROJECT:** Thamar Shefah
> **Generated:** 2026-09-21 14:57:15
> **Page Type:** Landing / Marketing

> ⚠️ **IMPORTANT:** Rules in this file **override** the Master file (`design-system/MASTER.md`).
> Only deviations from the Master are documented here. For all other rules, refer to the Master.

---

## Page-Specific Rules

### Layout Overrides

- **Max Width:** 1200px (standard)
- **Layout:** Full-width sections, centered content

### Spacing Overrides

- No overrides — use Master spacing

### Typography Overrides

- No overrides — use Master typography

### Color Overrides & Hero Accents

- **Hero Gradient:** Subtle radial gradient from rich deep burgundy (`#4A070D`) to `#240407` with ambient warm gold (`rgba(220, 164, 12, 0.15)`) glow.
- **Card Accents:** 1px gold border (`#EADBB6`) with warm ivory background (`#FFFFFF` and `#FDFBF7`).
- **Logo Integration:** Prominently featured in navigation header, hero badge, and footer with crisp proportions.

### Component Overrides

- Avoid: Default keyboard for all inputs
- Avoid: Desktop-first causing mobile issues
- Avoid: Enable by default everywhere

---

## Page-Specific Components

- No unique components for this page

---

## Recommendations

- Effects: Tonal elevation (overlay colors instead of strong shadows), pill-shaped buttons and chips (borderRadius 999), emphasized easing Easing.bezier(0.2,0,0,1), state layers (pressed overlays 10–15% opacity), Reanimated-filled label float for inputs, HapticFeedback on FAB/toggles
- Forms: Use inputmode attribute
- Responsive: Start with mobile styles then add breakpoints
- Touch: Disable where not needed
