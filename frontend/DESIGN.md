---
name: Visual AI Search & Smart Crop Assistant
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464555'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#4e45d5'
  on-secondary: '#ffffff'
  secondary-container: '#6860ef'
  on-secondary-container: '#fffbff'
  tertiary: '#005338'
  on-tertiary: '#ffffff'
  tertiary-container: '#006e4b'
  on-tertiary-container: '#67f4b7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#e3dfff'
  secondary-fixed-dim: '#c3c0ff'
  on-secondary-fixed: '#100069'
  on-secondary-fixed-variant: '#372abf'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.03em
  label-sm:
    fontFamily: Space Grotesk
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
---

## Brand & Style

This design system delivers an intelligent, precision-engineered visual commerce experience. It bridges cutting-edge computer vision with refined luxury shopping, creating an environment that feels instantaneous, authoritative, and effortlessly fluid.

### Aesthetic Direction
- **Style:** Contemporary Technical Elegance with Frosted Glass Overlay.
- **Visual Personality:** Confident, unobtrusive, sharp, and high-fidelity. Interface chrome yields priority to ingested visual imagery, bounding boxes, and extracted product nodes.
- **Emotional Response:** Empowers the shopper with perceived omniscience—instantly transforming any image, screenshot, or physical camera feed into shoppable, categorized metadata.

## Colors

The palette balances deep technical indigo tones against pristine slate backdrops, punctuated by high-signal emerald confidence cues.

### Color Hierarchy & Roles
- **Primary (`#4F46E5`):** Serves as the principal visual intelligence color—driving smart crop anchors, primary actions, active scan reticles, and focused selections.
- **Secondary (`#4338CA`):** Deployed for pressed states, layered contextual navigation bars, and deep interactive states.
- **Tertiary (`#10B981`):** Reserved strictly for match accuracy, visual match scores (e.g., "98% Visual Match"), in-stock confidence, and verified merchant validation.
- **Neutral Accent (`#0F172A`):** The grounding deep slate anchor for core typography, camera viewfinder surrounds, and high-contrast control surfaces.
- **Surface Neutrals:** Tinted slate whites (`#F8FAFC`, `#F1F5F9`) preventing optical glare while maintaining clinical clarity under vibrant photographic assets.

## Typography

The typographic hierarchy pairs the soft, geometric refinement of **Plus Jakarta Sans** with the algorithmic precision of **Space Grotesk**.

### Typographic Distribution
- **Display & Headings:** Plus Jakarta Sans delivers warm humanism to high-tech shopping, softening computational operations into approachable commerce moments. Tight negative tracking preserves density on vertical viewports.
- **Body & Editorial:** Plus Jakarta Sans provides optimal legibility across product cards, merchant bios, and attribute disclosures.
- **Labels, Metrics & Data Nodes:** Space Grotesk is deployed exclusively for confidence percentages, object coordinates, pricing, SKU tags, and dynamic visual crop badges, emphasizing real-time machine intelligence.

## Layout & Spacing

A mobile-first dynamic fluid grid constructed specifically for touch-native crop handles, thumbnail rails, and image-dense search results.

### Responsive Structure
- **Mobile (< 768px):** 4-column fluid layout with an edge-to-edge camera viewport canvas, 16px outer margins, and 12px gutters. Pinned bottom sheets host visual detection feeds with swipeable peek heights.
- **Tablet (768px - 1024px):** 8-column layout with 24px margins and 16px gutters, utilizing a split pane: 45% interactive crop source, 55% live product similarity grid.
- **Desktop (> 1024px):** 12-column layout max-capped at 1440px width with 32px gutters. Visual workbench presents canvas workspace centered with flanking attribute inspector and matching catalog panels.

## Elevation & Depth

Visual hierarchy combines physical tactile layers with frosted optical glass, giving image inspection toolbars the illusion of floating above user media.

### Elevation Levels
- **Level 0 (Canvas Base):** Ground slate surface (`#F8FAFC`) hosting image viewers and raw catalog feeds.
- **Level 1 (Extracted Cards & Tiles):** Pure white (`#FFFFFF`) with ultra-fine border `rgba(15, 23, 42, 0.06)` and ambient dispersion: `0 4px 16px -2px rgba(15, 23, 42, 0.04)`.
- **Level 2 (Crop Reticles & Floating Modals):** Translucent glass panels with `backdrop-filter: blur(16px)`, background fill `rgba(255, 255, 255, 0.78)`, border `1px solid rgba(255, 255, 255, 0.6)`, and lift shadow `0 12px 32px -4px rgba(15, 23, 42, 0.12)`.
- **Level 3 (Interactive Pinpoints & Drag Nodes):** Deep indigo glow with active projection: `0 0 0 3px rgba(255, 255, 255, 1), 0 6px 20px 0 rgba(79, 70, 229, 0.45)`.

## Shapes

The interface embraces an iOS-grade continuous curvature rhythm. The primary baseline of `0.5rem` scales to larger surface radii (`1rem` and `1.5rem`), eliminating visual tension and harmonizing sharp bounding boxes with smooth, tactile touchpoints.

### Specialized Geometry
- **Interactive Corner Handles:** Circular `9999px` anchors with internal concentric dot rings for resize handles.
- **Smart Crop Boundaries:** 2px solid vector lines using `rounded-lg` (16px) corners to frame detected garments and objects with smooth elegance instead of mechanical crosshairs.
- **Confidence Badges:** Curved mini-capsules (`rounded-md` or `rounded-lg`) framing technical metrics.

## Components

### Buttons
- **Primary (Visual Action):** Solid deep indigo (`#4F46E5`) with crisp white Plus Jakarta Sans medium typography, 0.5rem corner radius, vertical padding of 0.75rem, and subtle inset highlight border `inset 0 1px 0 rgba(255, 255, 255, 0.2)`. Active state shifts to `#4338CA`.
- **Secondary Glass Action:** Frosted translucent background `rgba(255, 255, 255, 0.85)` with `backdrop-filter: blur(8px)`, 1px border `rgba(15, 23, 42, 0.08)`, and text color `#0F172A`.
- **Icon Actions (Camera Shutter, Crop Flip):** Circular dual-ring design with active micro-scaling (0.95 scale down on touch press).

### Smart Crop Reticle & Interactive Pins
- **Detection Frame:** Dynamic vector box with primary indigo edges and 4 corner-draggable handles. Unfocused items retain a subtle pulsing white node (`rgba(255, 255, 255, 0.9)`) with ambient drop shadow.
- **Confidence Indicator:** Compact pill anchored to the bounding box header: Space Grotesk bold font, emerald background (`#10B981`) at 10% opacity, pure emerald text (`#059669`), and a solid dot indicator representing machine precision.

### Product Similarity Cards
- **Base Card:** Crisp white container, 1rem corner radius, subtle 1px slate-gray stroke. Displays extracted crop thumbnail alongside live retail matches.
- **Metadata Stack:** Space Grotesk price and visual match percentage stacked neatly above Plus Jakarta Sans product titles.
- **Hover/Tap Reaction:** Subtle 2px elevation jump with light refraction highlight and instant thumbnail cross-fade to alt-angle merchant shots.

### Input Fields & Filter Chips
- **Natural Language Visual Search Bar:** Floating pill input with glass backdrop blur, embedded image thumbnail token for active crop references, and indigo focus border ring.
- **Filter Chips:** Pill shapes (`rounded-xl`), toggling between passive state (`#F1F5F9` background, slate text) and active state (`#0F172A` background, white text, Space Grotesk tag metrics).

### Lists & Drawers
- **Peekable Results Sheet:** Native swipeable modal with top grab bar (36px wide, 4px thick, slate `#CBD5E1`), displaying matched items ranked by cosine visual similarity score descending.