# Design Guidelines: Ultra-Secure Lua Obfuscation Platform

## Design Approach: Modern Developer Tool with Security Focus

**Selected Approach**: Design System-inspired (Linear + GitHub + Vercel aesthetic)
**Rationale**: Developer productivity tool requiring clarity, trust, and professional polish. Security-focused applications demand clean interfaces that inspire confidence while maintaining technical sophistication.

**Core Design Principles**:
1. **Trust Through Clarity**: Every security feature visible but not overwhelming
2. **Technical Precision**: Sharp, exact UI elements that communicate capability
3. **Efficient Workflows**: Minimal steps from upload to download
4. **Dark-First Design**: Reduce eye strain for developers working long hours

---

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary)**:
- Background Base: 9 8% 10% (deep slate, almost black)
- Background Elevated: 217 19% 15% (slightly lighter surfaces for cards)
- Background Accent: 217 19% 18% (hover states, active areas)
- Primary Action: 217 91% 60% (vibrant blue for CTAs - obfuscate buttons)
- Success: 142 76% 45% (emerald for completed operations)
- Warning: 38 92% 50% (amber for medium security level)
- Danger: 0 84% 60% (red for extreme level, deletion)
- Text Primary: 210 40% 98% (near-white for main content)
- Text Secondary: 215 20% 65% (muted blue-gray for labels)
- Text Tertiary: 215 16% 47% (very muted for helper text)
- Border Subtle: 217 19% 20% (barely visible dividers)
- Border Strong: 217 19% 30% (prominent borders for focus states)

**Accent Colors**:
- Security Badge Glow: 142 76% 45% with 20% opacity (green glow for "secure" indicators)
- Code Highlight: 45 93% 58% (gold for syntax highlighting in previews)
- Obfuscation Active: 271 76% 53% (purple for processing states)

### B. Typography

**Font Stack**:
- Primary: 'Inter', system-ui, -apple-system, sans-serif (clean, modern, excellent readability)
- Code/Monospace: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace (for code display)

**Type Scale**:
- Hero/Display: 48px (3rem), weight 700, line-height 1.1
- Page Title: 32px (2rem), weight 600, line-height 1.2
- Section Heading: 24px (1.5rem), weight 600, line-height 1.3
- Card Title: 18px (1.125rem), weight 600, line-height 1.4
- Body Large: 16px (1rem), weight 400, line-height 1.6
- Body Regular: 14px (0.875rem), weight 400, line-height 1.5
- Caption/Label: 12px (0.75rem), weight 500, line-height 1.4, uppercase tracking
- Code: 14px, weight 400, line-height 1.6

### C. Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24 for consistency
- Component padding: p-6 or p-8
- Section spacing: gap-8 or gap-12
- Micro spacing: gap-2 or gap-4
- Page margins: px-6 md:px-12

**Grid Structure**:
- Main container: max-w-7xl mx-auto
- Two-column layout for upload/preview: grid-cols-1 lg:grid-cols-2 gap-8
- Card grids: grid-cols-1 md:grid-cols-2 xl:grid-cols-3

### D. Component Library

**Navigation**:
- Sticky header with backdrop blur
- Logo (left): "SOF" with shield icon, gradient text treatment
- Nav items (center): Dashboard, Obfuscate, Scripts, Documentation
- User indicator (right): Active users count badge, admin status icon

**Upload Zone**:
- Large drag-drop area (min-height 400px)
- Dashed border (border-2 border-dashed) in idle state
- Solid border with primary color when dragging over
- File icon (size-16) centered above text
- Accepted formats badge: ".lua, .txt" in small pill
- Click-to-browse button as secondary action

**Obfuscation Controls**:
- Radio button group for levels (Simple/Medium/Extreme)
- Each level shows: Name, description, estimated time, security badge
- Visual security indicator: 1-3 shield icons filled based on level
- Large "Obfuscate" button with gradient background and subtle glow

**Processing State**:
- Linear progress bar with animated gradient
- Percentage counter (large, centered)
- Processing stage labels: "Analyzing → Encrypting → Finalizing"
- Estimated time remaining in secondary text

**Results Panel**:
- Code preview in syntax-highlighted editor (readonly)
- Stats row: Original size, Obfuscated size, Compression ratio, Time taken
- Action buttons: Download .lua file, Copy loadstring, View in new tab
- Unique URL display with copy button

**Script Management Table**:
- Compact table with hover row highlights
- Columns: ID (truncated with copy), Size, Level badge, Created date, Access count, Actions
- Level badges: color-coded pills (Simple=blue, Medium=amber, Extreme=red)
- Action buttons: Download, View, Delete (with confirmation)

**Security Indicators**:
- Live "Active Users" counter with pulsing green dot
- "Bot Protection Active" badge in header
- Security level badges throughout with shield icons

**Authentication (Admin)**:
- Centered card on gradient background for login
- Simple username/password fields with visible validation
- "Login" button that transforms on submit
- No registration - admin only access

### E. Visual Effects & Interactions

**Micro-interactions**:
- Button hover: slight scale (scale-105) and brightness increase
- Card hover: subtle lift with shadow (shadow-lg → shadow-xl)
- Input focus: primary color border with subtle glow
- Copy button: checkmark animation on successful copy

**Code Display**:
- Syntax highlighting with VS Code Dark+ color scheme
- Line numbers in muted text
- Copy button floating in top-right corner

**Status Indicators**:
- Pulsing animation for "processing" states
- Success checkmark with scale-in animation
- Error shake animation for failed operations

**NO Complex Animations**: Avoid page transitions, scroll-triggered effects, or decorative animations. Keep it fast and functional.

---

## Page-Specific Layouts

### Landing/Login Page
- Full-screen centered card (max-w-md)
- Gradient background: radial gradient from primary to dark
- SOF logo large at top with tagline: "Military-Grade Lua Protection"
- Three feature bullets with icons below form
- Footer: "Ultra-secure obfuscation platform" text

### Main Dashboard
- Split view: Upload zone (left 60%) | Quick stats sidebar (right 40%)
- Recent scripts list below in full width
- Top stats row: Total scripts obfuscated, Total size processed, Active users

### Obfuscation Page
- Three-column flow: Upload → Configure → Preview
- Sticky configuration sidebar on medium+ screens
- Real-time preview updates as settings change

### Scripts Management
- Data table fills width
- Filters above table: Level, Date range, Search by ID
- Bulk actions: Select multiple for deletion

---

## Images

**Hero Section**: No large hero image needed - this is a tool, not a marketing site. Focus on functional UI.

**Icon Usage**: 
- Use Heroicons (outline style) via CDN for all UI icons
- Shield icons for security levels
- Document icons for files
- Lock icons for security features
- Arrow icons for downloads

**Decorative Elements**:
- Subtle grid pattern overlay on dark backgrounds (via CSS)
- Gradient orbs (blur-3xl) in background for depth (use sparingly)
- Code snippet backgrounds with faded syntax highlighting as decorative texture