# JiraStack Design System

## Philosophy

Extremely minimalist, clean, and calm. Inspired by Notion and Things. Heavy use of whitespace, subtle shadows, and muted backgrounds. Every element earns its place — no visual clutter.

## Color Palette

| Token | Value | Usage |
| ----- | ----- | ----- |
| `--color-bg` | `#FAFAFA` | Page background |
| `--color-surface` | `#FFFFFF` | Card backgrounds, input fields |
| `--color-primary` | `#0D9488` | Buttons, progress bar, active states |
| `--color-primary-hover` | `#0F766E` | Button hover state |
| `--color-text` | `#1A1A1A` | Primary text (headings, titles) |
| `--color-text-secondary` | `#6B7280` | Secondary text (labels, metadata) |
| `--color-text-muted` | `#9CA3AF` | Placeholder text, disabled states |
| `--color-border` | `#E5E7EB` | Card borders, input borders |
| `--color-border-focus` | `#0D9488` | Input focus ring |
| `--color-shadow` | `rgba(0, 0, 0, 0.04)` | Card shadows |
| `--color-success` | `#10B981` | Success states, completed indicators |
| `--color-error` | `#EF4444` | Error states, validation |

## Typography

| Element | Font | Weight | Size |
| ------- | ---- | ------ | ---- |
| Wordmark | Inter | 600 | 18px |
| Card title | Inter | 600 | 20px |
| Card metadata (issue key) | Inter | 500 | 13px |
| Body text / editor | Inter | 400 | 15px |
| Button label | Inter | 500 | 14px |
| Progress text | Inter | 400 | 13px |
| Pills (type/priority) | Inter | 500 | 12px |

## Spacing & Layout

- **Page max-width**: 640px, centered
- **Page padding**: 24px horizontal
- **Card padding**: 24px
- **Card gap (stack offset)**: 8px vertical, with decreasing opacity
- **Section spacing**: 24px between card stack, editor, and progress
- **Border radius**: 12px (cards, buttons, inputs)
- **Button padding**: 12px 24px

## Elevation & Shadows

| Level | Shadow | Usage |
| ----- | ------ | ----- |
| Card (top) | `0 4px 12px rgba(0, 0, 0, 0.06)` | Active/top card |
| Card (stacked) | `0 2px 6px rgba(0, 0, 0, 0.03)` | Cards beneath |
| Input focus | `0 0 0 2px rgba(13, 148, 136, 0.2)` | Focused text area |

## Components

### Top Bar

- Sticky, height 56px, white background with 1px bottom border (`--color-border`)
- Left: "JiraStack" wordmark in `--color-text`, font-weight 600
- Right: User display name in `--color-text-secondary` (sourced from Jira API `/myself`)

### Card Stack

- Top card: full opacity, elevated shadow, white background, 12px radius
- Stacked cards: offset 8px down each, opacity decreases (0.6, 0.3), slightly scaled down
- Card content:
  - Issue key (e.g. `PROJ-142`) — muted, uppercase, 13px
  - Summary/title — bold, 20px, single or two lines max
  - Pills row: issue type + priority as small rounded pills with subtle background tints

### Markdown Editor

- Textarea with 1px border (`--color-border`), 12px radius
- Min-height: 160px
- Placeholder: "Write a description..." in `--color-text-muted`
- Focus: border becomes `--color-primary`, subtle ring shadow

### Submit Button

- Background: `--color-primary`
- Text: white, font-weight 500
- Hover: `--color-primary-hover`
- Full width or right-aligned (contextual)
- Disabled state: opacity 0.5, cursor not-allowed

### Progress Indicator

- Thin bar (4px height), rounded, background `--color-border`
- Fill: `--color-primary`, width proportional to progress
- Text below/beside: "3 of 12 tickets remaining" in `--color-text-secondary`, 13px

### Empty/Done State

- Centered illustration or icon (optional, keep minimal)
- Heading: "All caught up!" — 24px, font-weight 600
- Subtext: "All your tickets have descriptions." — 15px, `--color-text-secondary`

## Animation Guidelines

- **Card clear**: Spring-based exit animation — card moves up and fades out (duration ~400ms, slight overshoot)
- **Card promote**: Next card springs into top position (duration ~300ms)
- **Button interactions**: Subtle scale on press (0.97), quick transition (150ms)
- **Page transitions**: Fade in content on load (200ms ease-out)
- **Motion library**: Use svelte-motion for spring physics on card transitions

## Responsive Behavior

- Below 640px: full-width with 16px padding
- Card stack remains centered
- Textarea becomes full-width
- Top bar remains sticky

## Accessibility

- All interactive elements must have visible focus states (teal ring)
- Color contrast ratios meet WCAG AA minimum (4.5:1 for text)
- Button and input labels are explicit
- Card content is semantic (headings, labels)
- Animations respect `prefers-reduced-motion` — disable springs, use instant transitions
