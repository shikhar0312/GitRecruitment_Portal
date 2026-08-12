---
name: GIT Recruitment System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#524433'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#857461'
  outline-variant: '#d7c3ad'
  surface-tint: '#825500'
  primary: '#825500'
  on-primary: '#ffffff'
  primary-container: '#f5a300'
  on-primary-container: '#623f00'
  inverse-primary: '#ffb952'
  secondary: '#555f6f'
  on-secondary: '#ffffff'
  secondary-container: '#d6e0f3'
  on-secondary-container: '#596373'
  tertiary: '#555f6d'
  on-tertiary: '#ffffff'
  tertiary-container: '#abb5c5'
  on-tertiary-container: '#3d4754'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffddb4'
  primary-fixed-dim: '#ffb952'
  on-primary-fixed: '#291800'
  on-primary-fixed-variant: '#633f00'
  secondary-fixed: '#d9e3f6'
  secondary-fixed-dim: '#bdc7d9'
  on-secondary-fixed: '#121c2a'
  on-secondary-fixed-variant: '#3d4756'
  tertiary-fixed: '#d9e3f4'
  tertiary-fixed-dim: '#bdc7d8'
  on-tertiary-fixed: '#121c28'
  on-tertiary-fixed-variant: '#3e4755'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-padding-desktop: 32px
  container-padding-mobile: 16px
  gutter: 24px
  section-gap: 64px
  element-gap: 16px
---

## Brand & Style
The brand personality is authoritative yet approachable, reflecting a premium corporate consulting ethos. It targets high-level software engineering talent and enterprise stakeholders, evoking feelings of trust, professional growth, and technological precision. 

The design system follows a **Corporate / Modern** style. It prioritizes clarity and efficiency through a systematic layout, generous whitespace, and a restrained use of its signature gold accent. This is a high-end enterprise SaaS aesthetic that avoids trend-driven visual clutter (like glassmorphism or neon) in favor of timeless, functional elegance.

## Colors
The palette is anchored by **GIT Gold (#F5A300)**, used strategically for primary actions and brand emphasis. Because of its vibrancy, it should be paired with high-contrast text (Charcoal) for accessibility.

**Charcoal (#1F2937)** serves as the foundation for primary typography and dark UI elements, providing a grounded, professional weight. **Secondary Text (#4B5563)** is used for metadata and descriptions to maintain a clear visual hierarchy.

The environment is strictly **Light Mode**. Surfaces use a clean white, while the global background uses a soft Slate-tinted white (#F8FAFC) to reduce eye strain and define the boundaries of cards and containers.

## Typography
This design system utilizes **Inter** exclusively to achieve a clean, systematic enterprise hierarchy. The type scale is designed for high legibility in data-heavy recruitment workflows.

Headlines use semi-bold weights with tight letter-spacing to create a strong, professional presence. Body text is optimized for readability with a 1.5x line-height ratio. Labels utilize medium weights and subtle tracking increases to distinguish them from body copy, particularly in forms and navigation elements.

## Layout & Spacing
The layout follows a **Fixed Grid** model on desktop, centered within a 1280px max-width container. It uses a 12-column system with 24px gutters. 

Spacing is based on a 4px baseline, with standard increments of 8px, 16px, 24px, and 32px for most UI relationships. Large sections should be separated by 64px to maintain the "spacious" premium feel. 

**Breakpoints:**
- **Desktop (1280px+):** 12 columns, 32px margins.
- **Tablet (768px - 1279px):** 6 columns, 24px margins, fluid width.
- **Mobile (Under 768px):** 2 columns, 16px margins, fluid width.

## Elevation & Depth
Depth is conveyed through **Ambient Shadows** and tonal layering. This design system avoids heavy, dark shadows in favor of light, diffused elevation that suggests a subtle lift from the page.

- **Level 1 (Cards/Inputs):** A 1px border (#E5E7EB) paired with a very soft shadow: `0 1px 3px rgba(0,0,0,0.05)`.
- **Level 2 (Dropdowns/Hover states):** A more pronounced but still airy shadow: `0 10px 15px -3px rgba(0,0,0,0.08)`.
- **Level 3 (Modals):** High diffusion to focus the user: `0 20px 25px -5px rgba(0,0,0,0.1)`.

Surfaces are primarily white (#FFFFFF), sitting on the light slate background (#F8FAFC) to create a clear separation of content areas.

## Shapes
In alignment with the "Rounded" requirement, all primary UI containers (cards, modals) use a radius of **12px (0.75rem)**. This provides a friendly, modern feel without sacrificing professional structure.

Buttons and input fields should utilize an **8px (0.5rem)** radius for a more precise, functional look, while decorative chips or status tags can utilize pill-shaping (full radius) to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Background #F5A300, Text #1F2937 (Semi-bold). No gradient.
- **Secondary:** Border 1.5px #E5E7EB, Text #1F2937. Background white.
- **Tertiary/Ghost:** Text #4B5563, background transparent.

### Input Fields
Inputs use a white background with a 1px border (#E5E7EB). On focus, the border transitions to #F5A300 with a subtle 2px gold outer glow at 20% opacity. Labels sit clearly above the input in `label-md`.

### Cards
Cards are the primary container for job listings and candidate profiles. They must feature a white background, a 1px border (#E5E7EB), and the Level 1 shadow. Internal padding should be a consistent 24px.

### Chips & Status Indicators
Small, rounded tags with low-saturation backgrounds (e.g., light gray or very light gold) to indicate job departments or application status.

### Lists
Lists use 1px horizontal dividers (#E5E7EB). Hover states for list items should use a subtle background shift to #F8FAFC.